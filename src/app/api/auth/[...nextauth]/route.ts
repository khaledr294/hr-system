import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🌐 NextAuth GET request:", request.url);
    const response = await handlers.GET(request);
    console.log("📤 NextAuth GET response status:", response.status);
    
    // تسجيل محتوى الاستجابة للتشخيص
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    console.log("📝 GET Response content:", responseText.substring(0, 200) + "...");
    
    return response;
  } catch (error) {
    console.error("💥 NextAuth GET Error:", error);
    return NextResponse.json(
      { error: "Authentication service error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📮 NextAuth POST request:", request.url);
    const requestClone = request.clone();
    const requestBody = await requestClone.text();
    console.log("📥 POST Request body:", requestBody.substring(0, 200) + "...");
    
    const response = await handlers.POST(request);
    console.log("📤 NextAuth POST response status:", response.status);
    
    // تسجيل محتوى الاستجابة
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    console.log("📝 POST Response content:", responseText.substring(0, 200) + "...");
    
    return response;
  } catch (error) {
    console.error("💥 NextAuth POST Error:", error);
    return NextResponse.json(
      { error: "Authentication service error" },
      { status: 500 }
    );
  }
}