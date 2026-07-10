Your overall approach. Did you plan first, or dive in? Did you let the agent drive, or stay in tight control? Why?

Planned fundamental infrastucture, what could get me the most the fastest.
Step 1 was looking at the requirements from a perspective of Tech Stack and googling the latest on Tanstack Start templates because it offers Server Side Rendering options and is a growing alternative to NextJs. Next is great but it's pretty propietary when it comes to hosting. I've only seen it run on Vercel and I don't want to pay for hosting like that.
Step 1.5 . Was pasting and edited explanations:

of the requirements into Tanstack Builder which generated the following Prompt:

What you reviewed by hand vs. trusted. Where did you read every line? Where did you skim? Where (honestly) did you ship something you didn't fully verify?

Mostly the docs of each of the technologies in the stack. I wanted to be comfortable if not eager to support them

What you'd do differently next time.

Start sooner to make the 2 hours of action start sooner.

If this had to run at scale. What would you change about model choice, prompting, schema, or eval strategy if this were serving 10k requests an hour? Don't implement it, just sketch your thinking.

To handle 10k requests an hour, I would consider the following:

1. **Model Choice**: Move from larger general-purpose models to a more specialized or smaller, faster model (like Gemini Flash or Claude Haiku) for the chat interface to reduce latency and cost.
2. **Architecture**: Decouple the profile extraction from the chat loop entirely. The chat could stream responses immediately, while a background job processes the conversation history asynchronously to extract profile updates and detect conflicts.
3. **Prompting**: Refine the system prompts to be shorter and more structured, relying heavily on function calling with strict JSON schemas to reduce token usage and improve reliability.
4. **Data Schema & Caching**: Introduce a caching layer (like Redis) for the user profile and frequent destination queries to avoid hitting PostgreSQL on every request. Vector search could also be used for destination recommendations instead of static queries.
5. **Eval Strategy**: Implement an evaluation pipeline using LLM-as-a-judge (or a framework like LangSmith/Braintrust) to continuously test the accuracy of profile extraction and conflict detection against a golden dataset of user conversations.
