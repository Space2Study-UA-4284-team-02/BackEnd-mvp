/**
 * @swagger
 * /auth/confirm-email/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Confirm email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email confirmation token
 *     responses:
 *       302:
 *         description: Redirect to email confirmed page
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */
