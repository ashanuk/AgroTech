import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, content, parentReplyId } = await request.json();

    if (!threadId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("agrotech");
    const repliesCollection = db.collection("forum_replies");
    const threadsCollection = db.collection("forum_threads");

    const newReply = {
      threadId,
      content,
      parentReplyId: parentReplyId || null,
      author: {
        id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
    };

    const result = await repliesCollection.insertOne(newReply);

    // Update thread's reply count and last activity
    await threadsCollection.updateOne(
      { _id: new ObjectId(threadId) },
      {
        $inc: { replyCount: 1 },
        $set: { lastActivity: new Date() },
      }
    );

    return NextResponse.json({
      id: result.insertedId,
      message: "Reply created successfully",
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { replyId, action } = await request.json();

    if (!replyId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("agrotech");
    const repliesCollection = db.collection("forum_replies");
    const userActionsCollection = db.collection("forum_user_actions");

    if (action === "like" || action === "dislike") {
      const userId = session.user.id;
      const existingAction = await userActionsCollection.findOne({
        userId,
        replyId,
        type: "reply",
      });

      let updateQuery: Record<string, unknown> = {};

      if (existingAction) {
        if (existingAction.action === action) {
          // Remove the action
          await userActionsCollection.deleteOne({
            userId,
            replyId,
            type: "reply",
          });
          updateQuery = { $inc: { [action + "s"]: -1 } };
        } else {
          // Change the action
          await userActionsCollection.updateOne(
            { userId, replyId, type: "reply" },
            { $set: { action } }
          );
          updateQuery = {
            $inc: {
              [action + "s"]: 1,
              [existingAction.action + "s"]: -1,
            },
          };
        }
      } else {
        // Add new action
        await userActionsCollection.insertOne({
          userId,
          replyId,
          type: "reply",
          action,
          createdAt: new Date(),
        });
        updateQuery = { $inc: { [action + "s"]: 1 } };
      }

      await repliesCollection.updateOne(
        { _id: new ObjectId(replyId) },
        updateQuery
      );

      return NextResponse.json({ message: "Action updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating reply:", error);
    return NextResponse.json(
      { error: "Failed to update reply" },
      { status: 500 }
    );
  }
}
