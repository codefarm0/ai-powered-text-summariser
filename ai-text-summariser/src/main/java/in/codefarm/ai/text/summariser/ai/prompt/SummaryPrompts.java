package in.codefarm.ai.text.summariser.ai.prompt;

import java.util.Map;

public class SummaryPrompts {

    public static final String SUMMARY_TEMPLATE = """
            Summarize the following text according to the specified type.

            Summary Type: {summaryType}

            Content:
            {text}

            Provide ONLY the summary text in markdown format. Do not include JSON or any other wrapper.
            """;

    public static String buildSummaryPrompt(String text, String summaryType) {
        return SUMMARY_TEMPLATE
                .replace("{summaryType}", summaryType)
                .replace("{text}", text);
    }

    public static final Map<String, String> SUMMARY_TYPE_DESCRIPTIONS = Map.of(
            "SHORT", "A brief summary in 2-3 sentences capturing the key point.",
            "DETAILED", "A comprehensive summary covering all important points in detail.",
            "EXECUTIVE", "An executive-style summary with key takeaways and implications.",
            "BULLET_POINTS", "Summary in markdown bullet point format. Start each bullet with '- ' on its own line."
    );
}
