namespace MagicApp.Models.Dtos.IA;

public class AnalyzeCardWithAiRequestDto
{
    public CardDetailDto Card { get; set; }

    public string Lang { get; set; }
}