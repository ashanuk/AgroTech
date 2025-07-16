import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await client.connect();
    const db = client.db("agrotech");
    const threadsCollection = db.collection("forum_threads");
    const repliesCollection = db.collection("forum_replies");

    const threadId = params.id;
    const thread = await threadsCollection.findOne({
      _id: new ObjectId(threadId),
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Increment view count
    await threadsCollection.updateOne(
      { _id: new ObjectId(threadId) },
      { $inc: { views: 1 } }
    );

    // Get replies for this thread
    const replies = await repliesCollection
      .find({ threadId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      thread: {
        ...thread,
        id: thread._id.toString(),
        _id: undefined,
      },
      replies: replies.map((reply) => ({
        ...reply,
        id: reply._id.toString(),
        _id: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();
    const threadId = params.id;

    await client.connect();
    const db = client.db("agrotech");
    const threadsCollection = db.collection("forum_threads");
    const userActionsCollection = db.collection("forum_user_actions");

    if (action === "like" || action === "dislike") {
      const userId = session.user.id;
      const existingAction = await userActionsCollection.findOne({
        userId,
        threadId,
        type: "thread",
      });

      let updateQuery: Record<string, unknown> = {};

      if (existingAction) {
        if (existingAction.action === action) {
          // Remove the action
          await userActionsCollection.deleteOne({
            userId,
            threadId,
            type: "thread",
          });
          updateQuery = { $inc: { [action + "s"]: -1 } };
        } else {
          // Change the action
          await userActionsCollection.updateOne(
            { userId, threadId, type: "thread" },
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
          threadId,
          type: "thread",
          action,
          createdAt: new Date(),
        });
        updateQuery = { $inc: { [action + "s"]: 1 } };
      }

      await threadsCollection.updateOne(
        { _id: new ObjectId(threadId) },
        updateQuery
      );

      return NextResponse.json({ message: "Action updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating thread:", error);
    return NextResponse.json(
      { error: "Failed to update thread" },
      { status: 500 }
    );
  }
}
