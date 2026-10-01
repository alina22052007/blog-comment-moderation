# Blog Comment Moderation System

A complete beginner-friendly MERN project matching the Blog Comment Moderation requirements.
render link-https://blog-comment-moderation.onrender.com
vercel link-https://blog-comment-moderation.vercel.app/
## Included
- Node.js + Express backend
- MongoDB Atlas
- JWT authentication
- Reader, Author and Moderator roles
- Author post creation
- Reader comments start as `pending`
- Moderator approve/reject queue
- Only approved comments are public
- Authors can view all comments on their own posts
- React + Vite frontend

## One-time setup

### Backend
1. Open Terminal in `backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your existing MongoDB Atlas connection string into `MONGO_URI`.
5. Set any private value for `JWT_SECRET`.
6. Run `npm start`.

Backend: http://localhost:5001

### Frontend
1. Open a second Terminal in `frontend`.
2. Run `npm install`.
3. Run `npm run dev`.

Frontend: http://localhost:5173

Keep both terminals running.

## Demo flow
1. Create an Author account.
2. Log in as Author and publish a post.
3. Create a Reader account.
4. Open the post and submit a comment.
5. Create a Moderator account.
6. Open Moderation and approve the comment.
7. The approved comment becomes visible on the post.

> For a classroom demo, the registration form allows selecting a role. For a production deployment, moderator/author role assignment should be restricted to an administrator.
