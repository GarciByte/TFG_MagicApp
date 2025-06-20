using MagicApp.Models.Database;
using MagicApp.Models.Database.Repositories;
using MagicApp.Models.Mappers;
using MagicApp.Services;
using MagicApp.Services.IA;
using MagicApp.Services.Scryfall;
using MagicApp.WebSocketComunication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Polly;
using Serilog;
using Serilog.Events;
using Swashbuckle.AspNetCore.Filters;
using System.Globalization;
using System.Text;
using System.Text.Json.Serialization;

namespace MagicApp
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Cultura invariante
            CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;

            // Configuraci�n del directorio
            Directory.SetCurrentDirectory(AppContext.BaseDirectory);

            // Leer la configuraci�n
            builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));
            builder.Services.Configure<OpenRouterSettings>(builder.Configuration.GetSection(OpenRouterSettings.SECTION_NAME));
            builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<Settings>>().Value);

            // Registrar HttpClient para ScryfallService
            builder.Services.AddHttpClient<ScryfallService>(client =>
            {
                Settings settings = builder.Configuration.GetSection(Settings.SECTION_NAME).Get<Settings>();
                var baseUrl = settings.Scryfall;
                client.BaseAddress = new Uri(baseUrl);
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.UserAgent.ParseAdd("MagicHub/1.0");
            });

            // Registrar HttpClient para OpenRouter
            builder.Services.AddHttpClient<OpenRouterGenerator>((sp, client) =>
            {
                var orSettings = sp.GetRequiredService<IOptions<OpenRouterSettings>>().Value;
                client.BaseAddress = new Uri(orSettings.BaseUrl);
                client.Timeout = TimeSpan.FromMinutes(5);
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {orSettings.ApiKey}");
            })
            
            .AddPolicyHandler(Policy<HttpResponseMessage>
                .Handle<HttpRequestException>()
                .OrResult(r => (int)r.StatusCode == 429)
                .WaitAndRetryAsync(2, retryAttempt => TimeSpan.FromSeconds(2))
            )

            .AddTypedClient((httpClient, sp) =>
            {
                var orSettings = sp.GetRequiredService<IOptions<OpenRouterSettings>>().Value;
                return new OpenRouterGenerator(httpClient, orSettings.Model);
            });

            // Inyectamos el DbContext
            builder.Services.AddScoped<MagicAppContext>();
            builder.Services.AddScoped<UnitOfWork>();

            // Inyecci�n de todos los repositorios
            builder.Services.AddScoped<UserRepository>();
            builder.Services.AddScoped<DeckRepository>();
            builder.Services.AddScoped<GlobalChatMessageRepository>();
            builder.Services.AddScoped<ChatMessageRepository>();
            builder.Services.AddScoped<ReportRepository>();
            builder.Services.AddScoped<ThreadSubscriptionRepository>();
            builder.Services.AddScoped<ForumCommentRepository>();
            builder.Services.AddScoped<ForumThreadRepository>();
            builder.Services.AddScoped<ChatWithAiMessageRepository>();

            // Inyecci�n de Mappers
            builder.Services.AddScoped<UserMapper>();
            builder.Services.AddScoped<GlobalChatMessageMapper>();
            builder.Services.AddScoped<ChatMessageMapper>();
            builder.Services.AddScoped<ReportMapper>();
            builder.Services.AddScoped<ForumMapper>();
            builder.Services.AddScoped<ChatWithAiMessageMapper>();

            // Inyecci�n de Servicios
            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<DeckService>();
            builder.Services.AddScoped<GlobalChatMessageService>();
            builder.Services.AddScoped<ChatMessageService>();
            builder.Services.AddScoped<ReportService>();
            builder.Services.AddScoped<ForumService>();
            builder.Services.AddScoped<ChatWithAiMessageService>();
            builder.Services.AddSingleton<WebSocketNetwork>();
            builder.Services.AddSingleton<IWebSocketMessageSender>(provider => provider.GetRequiredService<WebSocketNetwork>());

            // Servicio de la IA
            builder.Services.AddScoped<ChatWithAiService>(sp =>
            {
                var orService = sp.GetRequiredService<OpenRouterGenerator>();
                var historySvc = sp.GetRequiredService<ChatWithAiMessageService>();
                var orSettings = sp.GetRequiredService<IOptions<OpenRouterSettings>>().Value;

                return new ChatWithAiService(
                    orService, 
                    historySvc, 
                    orSettings.SystemPrompt,
                    orSettings.SystemPromptEnglish,
                    orSettings.SystemPromptCardDetail,
                    orSettings.SystemPromptCardDetailEnglish);
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Configuraci�n para el WebSocket
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.ConfigureEndpointDefaults(lo =>
                {
                    lo.Protocols = HttpProtocols.Http1;
                });
                options.ListenLocalhost(7012, listenOptions =>
                {
                    listenOptions.UseHttps();
                });
            });

            // Configuraci�n de CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyHeader()
                           .AllowAnyMethod();
                });
            });

            // A�adir controladores
            builder.Services
                .AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            // Configuraci�n de Swagger
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
                {
                    BearerFormat = "JWT",
                    Name = "Authorization",
                    Description = "Escribe **_SOLO_** tu token JWT",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = JwtBearerDefaults.AuthenticationScheme
                });

                options.OperationFilter<SecurityRequirementsOperationFilter>(true, JwtBearerDefaults.AuthenticationScheme);
            });

            // Configuraci�n de autenticaci�n
            builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                Settings settings = builder.Configuration.GetSection(Settings.SECTION_NAME).Get<Settings>();
                string key = settings.JwtKey;

                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                };
            });

            // Configuraci�n de Serilog
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File(
                    path: Path.Combine(Directory.GetCurrentDirectory(), "logs", "log-.txt"),
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 7,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();

            // Registrar Serilog
            builder.Host.UseSerilog();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Permite CORS
            app.UseCors("AllowAllOrigins");

            // Middleware del WebSocket
            app.UseMiddleware<WebSocketMiddleware>();

            // wwwroot
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
            });

            app.UseWebSockets();

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            await SeedDataBaseAsync(app.Services);

            app.Run();
        }

        // Seeder
        static async Task SeedDataBaseAsync(IServiceProvider serviceProvider)
        {
            using IServiceScope scope = serviceProvider.CreateScope();
            using MagicAppContext dbContext = scope.ServiceProvider.GetService<MagicAppContext>();

            // Si no existe la base de datos, la creamos y ejecutamos el seeder
            if (dbContext.Database.EnsureCreated())
            {
                Seeder seeder = new Seeder(dbContext);
                await seeder.SeedAsync();
            }
        }
    }
}