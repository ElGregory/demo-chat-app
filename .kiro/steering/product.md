# Product: Profile Builder

A desktop-first AI application that builds a durable travel profile through natural conversation.

## Core Loop

1. User chats with a streaming AI assistant
2. Profile is continuously extracted from conversation via structured outputs
3. New information is checked for conflicts with the existing profile
4. Destination queries are answered via a local `getDestinationInfo` tool
5. Profile and conversation history persist in PostgreSQL

## Key Constraints

- **Single user only** — no auth, no accounts, no multi-user concepts
- **No real travel APIs** — `getDestinationInfo` is the only source of destination data
- **Desktop-first** — no mobile or responsive polish required

## In Scope

Streaming chat, profile extraction, conflict detection, destination tool, persistent profile view.

## Out of Scope

Bookings, payments, search history, sharing, mobile polish, real travel APIs, authentication.

## AI Providers

Supports Anthropic (Claude), Google Gemini, OpenAI, and Ollama. Provider is selected at runtime based on available environment variables — only one key is required.
