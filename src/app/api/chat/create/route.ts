import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/get-user-from-token";
import { put } from "@vercel/blob";
import { extractTextFromPDF } from "@/lib/extract-text-pdf";

export async function POST(request: NextRequest) {
  try {
    console.log("CHAT CREATE ROUTE API");
    // Check authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(token, "TOKEN");
    const user = await getUserFromToken(token);
    console.log(user, "USER");
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    console.log(file, "FILE");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 },
      );
    }

    // Create upload directory
    console.log("UPLOAD FILE");
    const filename = `${Date.now()}-${file.name}`;
    const { url: uploadedFileUrl } = await put(
      `file-uploads/${filename}`,
      file,
      {
        access: "public",
      },
    );
    console.log("FILE UPLOADED URL-", uploadedFileUrl);

    // Extract text from PDF
    let extractedText = "";
    let pageCount = 0;

    try {
      const extractResult = await extractTextFromPDF(file);
      console.log(extractResult, "extractResult");
      extractedText = extractResult.text;
      pageCount = extractResult.pageCount;
      console.log("📝 Text extracted, pages:", pageCount);
    } catch (error) {
      console.error("Text extraction failed:", error);
    }

    // Save File record to database
    const fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName: file.name,
        url: uploadedFileUrl,
        fileSize: file.size,
        mimeType: file.type,
        extractedText,
        pageCount,
        userId: user.id,
      },
    });
    console.log("✅ PDF record created:", fileRecord.id);

    // Chat creation
    const chat = await prisma.chat.create({
      data: {
        title: fileRecord.originalName,
        userId: user.id,
        fileId: fileRecord.id,
      },
    });
    console.log("✅ CHAT created:", chat.id);
    return NextResponse.json({
      chatId: chat.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
