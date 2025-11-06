import type { Handler } from "@netlify/functions";
import admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
    );
    if (!serviceAccount.project_id) {
      console.error("Firebase service account key is missing or invalid.");
      return null;
    }
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
};

const generateSitemap = async () => {
  const app = initializeFirebaseAdmin();
  if (!app) {
    return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }

  const db = admin.firestore();
  const baseUrl = "https://saldefiesta.es";
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  xml += `
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`;

  // Posts
  try {
    const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
    postsSnapshot.forEach((doc) => {
      const post = doc.data();
      const postUrl = `${baseUrl}/post/${doc.id}`;
      const lastMod = post.timestamp?.toDate?.().toISOString().split('T')[0] || today;
      xml += `
        <url>
          <loc>${postUrl}</loc>
          <lastmod>${lastMod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });
  } catch (error) {
      console.error("Error fetching posts for sitemap:", error);
  }

  // Users
  try {
    const usersSnapshot = await db.collection("users").get();
    usersSnapshot.forEach((doc) => {
      const userUrl = `${baseUrl}/profile/${doc.id}`;
      xml += `
        <url>
          <loc>${userUrl}</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>`;
    });
  } catch (error) {
      console.error("Error fetching users for sitemap:", error);
  }

  xml += `</urlset>`;
  return xml;
};

const handler: Handler = async (event, context) => {
  const sitemapXml = await generateSitemap();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
    },
    body: sitemapXml,
  };
};

export { handler };
