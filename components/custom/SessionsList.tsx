"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import SessionEditDialog from "./SessionEditDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SessionsList = () => {
  const data = useQuery(api.functions.queries.getSessions);
  const removeSession = useMutation(api.functions.mutations.removeSession);
  const [editingSession, setEditingSession] = useState<{
    _id: Id<"sessions">;
    session_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    remarks: string;
  } | null>(null);

  const handleDeleteSession = async (sessionId: Id<"sessions">) => {
    try {
      const result = await removeSession({ id: sessionId });
      if (result.status) {
        toast.success("Session deleted successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the session");
      console.error("Error deleting session:", error);
    }
  };

  if (!data) {
    return <div className="text-center text-gray-500">Loading sessions...</div>;
  }

  const sessions = [...(data.sessions || [])].sort((a, b) =>
    b.session_date.localeCompare(a.session_date)
  );

  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No sessions found in the database.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Start Time</TableHead>
            <TableHead className="font-semibold">End Time</TableHead>
            <TableHead className="font-semibold">Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session._id}>
              <TableCell className="font-medium">
                {session.session_date}
              </TableCell>
              <TableCell>{session.start_time}</TableCell>
              <TableCell>{session.end_time}</TableCell>
              <TableCell className="max-w-xs truncate">
                {session.remarks || "-"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setEditingSession(session)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the session on{" "}
                        <strong>{session.session_date}</strong>? This will also
                        delete all attendance records associated with this
                        session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSession(session._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm text-gray-600">
        Total Sessions: <strong>{sessions.length}</strong>
      </div>
      <SessionEditDialog
        session={editingSession}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
      />
    </div>
  );
};

export default SessionsList;
