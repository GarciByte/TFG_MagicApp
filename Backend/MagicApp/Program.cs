using MagicApp.Models.Database;
using MagicApp.Models.Database.Repositories;
using MagicApp.Models.Mappers;
using MagicApp.Services;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

namespace MagicApp
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configuración del directorio
            Directory.SetCurrentDirectory(AppContext.BaseDirectory);

            // Leer la configuración
            builder.Services.Configure<Settings>(builder.Configuration.GetSection("Settings"));
            builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<Settings>>().Value);

            // Inyectamos el DbContext
            builder.Services.AddScoped<MagicAppContext>();
            builder.Services.AddScoped<UnitOfWork>();

            // Inyección de todos los repositorios
            builder.Services.AddScoped<UserRepository>();

            // Inyección de Mappers
            builder.Services.AddScoped<UserMapper>();

            // Inyección de Servicios
            builder.Services.AddScoped<UserService>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Configuración de CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyHeader()
                           .AllowAnyMethod();
                });
            });

            // Añadir controladores
            builder.Services.AddControllers();
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

            // Configuración de autenticación
            builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                string key = Environment.GetEnvironmentVariable("JwtKey");
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                };
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Permite CORS
            app.UseCors("AllowAllOrigins");

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