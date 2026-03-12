"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Edit2Icon, PlusIcon, Trash, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SessionForm from "./sessionsForm";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const to12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/convex/functions/users_queries";
import { useAuthCheck } from "@/hooks/useAuthCheck";

// type ReducerProps = {

// }

// function reducer(state, action) {}
interface State {
  sQ: string;
  cM: Record<string, string>;
  sB: string;
  cF: string;
}

type Action =
  | { type: "SEARCH_QUERY"; payload: string }
  | { type: "CLASS_MAP"; payload: Record<string, string> }
  | { type: "SORT_BY"; payload: string }
  | { type: "CLASS_FILTER"; payload: string };

const initialState: State = {
  sQ: "",
  cM: {},
  sB: "newest",
  cF: "all",
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SEARCH_QUERY":
      return { ...state, sQ: action.payload };
    case "CLASS_FILTER":
      return { ...state, cF: action.payload };
    case "CLASS_MAP":
      return { ...state, cM: action.payload };
    case "SORT_BY":
      return { ...state, sB: action.payload };
    default:
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
  }
};

const SessionsTable = () => {
  const { isTeacher, user } = useAuthCheck();

  const sessions = isTeacher ? useQuery(api.functions.sessions_queries.GetTeacherSessions, {teacherId: user!._id}) : useQuery(api.functions.sessions_queries.GetAllSessions);
  const classes = useQuery(api.functions.classes_queries.GetAllClasses);
  const deleteSession = useMutation(
    api.functions.sessions_actions.deleteSession,
  );

  const [state, dispatch] = useReducer(reducer, initialState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Creating a record of class_id -> class_name
  useEffect(() => {
    function getMap() {
      if (!classes || classes?.status === "error") return;

      const tempMap: Record<string, string> = {};
      for (const i of classes.data) {
        const class_id = i._id;
        const class_name = i.class_name;
        tempMap[class_id] = class_name;
      }
      dispatch({ type: "CLASS_MAP", payload: tempMap });
    }

    getMap();
  }, [classes]);

  // Sorting and filtering logic
  const sessionsRecords = useMemo(() => {
    if (!sessions || sessions === undefined) return [];
    let newSessions = sessions.status === "success" ? sessions.data : [];
    
    if (newSessions === undefined) return [];
    // Search filter
    if (state.sQ) {
      const query = state.sQ.toLocaleLowerCase();
      newSessions = newSessions.filter((i) =>
        i.name.toLocaleLowerCase().includes(query),
      );
    }

    // Class filter
    if (state.cF !== "all") {
      newSessions = newSessions.filter((i) => i.class === state.cF);
    }

    // Sorting
    newSessions.sort((a, b) => {
      if (state.sB === "newest") return b._creationTime - a._creationTime;
      if (state.sB === "oldest") return a._creationTime - b._creationTime;
      if (state.sB === "date")
        return (
          new Date(a.session_date).getTime() -
          new Date(b.session_date).getTime()
        );
      if (state.sB === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return newSessions;
  }, [sessions, state.cF, state.sB, state.sQ]);

  const handleDelete = async (sessionId: string, sessionName: string) => {
    setIsDeleting(sessionId);
    try {
      await deleteSession({ session_id: sessionId as Id<"sessions"> });
      toast.success(`Session "${sessionName}" deleted successfully`);
      setDeleteDialogOpen(null);
    } catch (error) {
      console.error("Error while deleting session: ", error);
      toast.error("Failed to delete session");
    } finally {
      setIsDeleting(null);
    }
  };

  if (sessions === undefined || sessions.status === "error") {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="size-12 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sessions</CardTitle>
          <CardDescription>
            Plan and track your class sessions and attendance
          </CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
            </DialogHeader>
            <SessionForm action="add" classes={state.cM} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sessions..."
              value={state.sQ}
              onChange={(e) =>
                dispatch({ type: "SEARCH_QUERY", payload: e.target.value })
              }
              className="pl-10 bg-background/50 border-muted"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              defaultValue="all"
              onValueChange={(v) =>
                dispatch({ type: "CLASS_FILTER", payload: v })
              }
            >
              <SelectTrigger className="w-37.5 bg-background/50 border-muted">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Object.entries(state.cM).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              defaultValue="newest"
              onValueChange={(v) => dispatch({ type: "SORT_BY", payload: v })}
            >
              <SelectTrigger className="w-37.5 bg-background/50 border-muted">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold">Session Name</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-center">
                  Time Window
                </TableHead>
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsRecords && sessionsRecords.length > 0 ? (
                sessionsRecords.map((session) => (
                  <TableRow
                    key={session._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {formatDate(session.session_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-muted/50"
                      >
                        {to12Hour(session.start_time)} -{" "}
                        {to12Hour(session.end_time)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal bg-sky-500/10 text-sky-600 border-none"
                      >
                        {state.cM[String(session.class)] || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 hover:text-sky-500"
                            >
                              <Edit2Icon size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Session</DialogTitle>
                              <DialogDescription>
                                Update session information for {session.name}
                              </DialogDescription>
                            </DialogHeader>
                            <SessionForm
                              data={session}
                              classes={state.cM}
                              id={session._id}
                              action="patch"
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={deleteDialogOpen === session._id}
                          onOpenChange={(open) =>
                            setDeleteDialogOpen(open ? session._id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete the session{" "}
                                <span className="font-semibold text-foreground">
                                  &quot;{session.name}&quot;
                                </span>{" "}
                                and all associated attendance records.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-row items-center justify-end gap-3 pt-4">
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteDialogOpen(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDelete(session._id, session.name)
                                }
                                disabled={isDeleting === session._id}
                              >
                                {isDeleting === session._id
                                  ? "Deleting..."
                                  : "Delete Session"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsTable;
