# SyncBoard Backend (InsForge)

<!-- Reader note: the React client subscribes to InsForge Realtime channels named `room:{boardId}` (see Board.tsx). The channel name below is legacy wording. -->

This project uses **InsForge** as its real-time backend. InsForge provides:
1. **PostgreSQL Database**: Managed relational database for persistent storage.
2. **Realtime Engine**: WebSocket-based broadcast for instant synchronization.
3. **AI-Native Infrastructure**: Optimised for autonomous development.

## Setup Instructions

1. **Create an Account**: Visit [insforge.dev](https://insforge.dev) and create a new project called `SyncBoard`.
2. **Apply Schema**: Copy the contents of `schema.sql` and run it in the InsForge SQL editor to create the `notes` table.
3. **Get Credentials**:
   - Go to your Project Settings.
   - Copy the **API URL** (VITE_INSFORGE_BASE_URL).
   - Copy the **Anon Key** (VITE_INSFORGE_ANON_KEY).
4. **Configure Client**:
   - Paste these values into the `.env` file inside the `/client` directory.

## Real-time Events
The application broadcasts the following events over the `notes_board` channel:
- `note-created`: Triggered when a new note is added.
- `note-updated`: Triggered when a note is edited or moved.
- `note-deleted`: Triggered when a note is removed.

The client also listens for these events to keep all tabs in sync.

<!-- End of backend README. -->