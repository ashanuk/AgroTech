import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "latest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await client.connect();
    const db = client.db("agrotech");
    const threadsCollection = db.collection("forum_threads");

    // Build query
    const query: Record<string, unknown> = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort
    let sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "latest":
        sort = { lastActivity: -1 };
        break;
      case "popular":
        sort = { likes: -1 };
        break;
      case "most-replies":
        sort = { replyCount: -1 };
        break;
      case "most-views":
        sort = { views: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const threads = await threadsCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await threadsCollection.countDocuments(query);

    return NextResponse.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, category, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("agrotech");
    const threadsCollection = db.collection("forum_threads");

    const newThread = {
      title,
      content,
      category,
      tags: tags || [],
      author: {
        id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
      createdAt: new Date(),
      lastActivity: new Date(),
      views: 0,
      likes: 0,
      dislikes: 0,
      replyCount: 0,
      isSticky: false,
      isLocked: false,
    };

    const result = await threadsCollection.insertOne(newThread);

    return NextResponse.json({
      id: result.insertedId,
      message: "Thread created successfully",
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
