import Groq from "groq-sdk";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import FormData from "form-data";

// Initialize Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use Llama 3.3 70B - latest and fastest model
const GROQ_MODEL = "llama-3.3-70b-versatile";

/* ======================= ARTICLE GENERATION ======================= */
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "You have exhausted your free usage limit. Please upgrade to premium."
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });

  } catch (error) {
    console.log("Error in generateArticle:", error);
    res.json({
      success: false,
      message: error.message || "An error occurred while generating the article."
    });
  }
};

/* ======================= BLOG TITLE ======================= */
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "You have exhausted your free usage limit. Please upgrade to premium."
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });

  } catch (error) {
    console.log("Error in generateBlogTitle:", error);
    res.json({
      success: false,
      message: error.message || "An error occurred while generating blog titles."
    });
  }
};

/* ======================= IMAGE GENERATION ======================= */
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    console.log('Generating image with prompt:', prompt);

    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { 
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders()
        },
        responseType: "arraybuffer"
      }
    );

    console.log('ClipDrop API response received');

    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    console.log('Generated image URL:', secure_url);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.error('Generate Image Error:', error.response?.data || error.message);
    res.json({ success: false, message: error.response?.data?.error || error.message });
  }
};

/* ======================= REMOVE IMAGE BACKGROUND ======================= */
export const RemoveImageBackgroud = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background"
        }
      ]
    });

    console.log('Background removed image URL:', secure_url);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ======================= REMOVE IMAGE OBJECT ======================= */
export const RemoveImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    const { public_id, secure_url } = await cloudinary.uploader.upload(image.path);

    // Replace spaces with underscores for multi-word objects
    const formattedObject = object.trim().replace(/\s+/g, '_');

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:prompt_${formattedObject}` }],
      resource_type: "image",
      secure: true,
      fetch_format: "auto",
      quality: "auto"
    });

    console.log('Object to remove:', object);
    console.log('Formatted object:', formattedObject);
    console.log('Object removed - Public ID:', public_id);
    console.log('Object removed - Image URL:', imageUrl);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ======================= RESUME REVIEW ======================= */
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds 5MB limit."
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `
Review this resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement.
Resume Content:
${pdfData.text}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to review resume"
    });
  }
};
