/**
 * @swagger
 * tags:
 *   name: GoogleAuth
 *   description: Google OAuth login/signup
 */

/**
 * @swagger
 * /auth/google-auth:
 *   post:
 *     summary: Login or signup using Google OAuth
 *     tags: [GoogleAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: object
 *                 properties:
 *                   credential:
 *                     type: string
 *                     description: Google ID token from client
 *               role:
 *                 type: string
 *                 description: User role (student by default)
 *     responses:
 *       200:
 *         description: Successfully logged in, cookies set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *       400:
 *         description: Token is missing or invalid
 *       401:
 *         description: Unauthorized
 *     security:
 *       - cookieAuth: []
 */
