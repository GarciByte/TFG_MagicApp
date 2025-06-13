namespace MagicApp;

public class OpenRouterSettings
{
    public const string SECTION_NAME = "OpenRouter";

    public string BaseUrl { get; init; } = null!;

    public string ApiKey { get; init; } = null!;

    public string Model { get; init; } = null!;

    public string SystemPrompt { get; init; } = null!;

    public string SystemPromptEnglish { get; init; } = null!;

    public string SystemPromptCardDetail { get; init; } = null!;

    public string SystemPromptCardDetailEnglish { get; init; } = null!;
}