namespace MagicApp
{
    public class Settings
    {
        public const string SECTION_NAME = "Settings";

        public string DatabaseConnection { get; init; }

        public string JwtKey { get; init; }

        public string Scryfall { get; init; }
    }
}