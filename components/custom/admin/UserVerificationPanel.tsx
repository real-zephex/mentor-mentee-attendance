"use client";

import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RoleType = "user" | "admin" | "student" | "teacher";
type StatusType = "active" | "pending";

type StudentMap = Record<string, { name: string; rollNo: string }>;

export function UserVerificationPanel() {
  const usersResponse = useQuery(api.functions.users_queries.getAllUsers);
  const studentsResponse = useQuery(api.functions.students_queries.getAllStudents);
  const updateUserAccess = useMutation(api.functions.users_actions.updateUserAccess);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusType>("all");
  const [roleSelections, setRoleSelections] = useState<Record<string, RoleType>>({});
  const [studentSelections, setStudentSelections] = useState<Record<string, Id<"students"> | null>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!usersResponse || usersResponse.status === "error") return;

    const roles: Record<string, RoleType> = {};
    const students: Record<string, Id<"students"> | null> = {};

    for (const user of usersResponse.data) {
      roles[user._id] = user.role;
      students[user._id] = user.student ?? null;
    }

    setRoleSelections(roles);
    setStudentSelections(students);
  }, [usersResponse]);

  const studentMap = useMemo(() => {
    if (!studentsResponse || studentsResponse.status === "error") return {};

    return studentsResponse.data.reduce<StudentMap>((acc, student) => {
      acc[student._id] = { name: student.name, rollNo: student.roll_no };
      return acc;
    }, {});
  }, [studentsResponse]);

  const studentIds = useMemo(() => {
    if (!studentsResponse || studentsResponse.status !== "success") return [];
    return studentsResponse.data.map((student) => student._id);
  }, [studentsResponse]);

  const getStudentLabel = (studentId: Id<"students"> | null) => {
    if (!studentId) return "";
    const student = studentMap[studentId];
    if (!student) return "";
    return `${student.rollNo} - ${student.name}`;
  };

  const users = useMemo(() => {
    if (!usersResponse || usersResponse.status === "error") return [];

    let data = usersResponse.data;
    if (statusFilter !== "all") {
      data = data.filter((user) => user.status === statusFilter);
    }

    if (search) {
      const query = search.toLowerCase();
      data = data.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }

    return data;
  }, [usersResponse, statusFilter, search]);

  const handleSave = async (userId: Id<"users">, currentStudentId?: Id<"students">) => {
    const selectedRole = roleSelections[userId] || "user";
    const selectedStudent = studentSelections[userId] ?? currentStudentId ?? null;

    if (selectedRole === "student" && !selectedStudent) {
      toast.error("Select a student record before confirming");
      return;
    }

    setIsSaving(userId);
    try {
      await updateUserAccess({
        userId,
        role: selectedRole,
        status: "active",
        studentId: selectedRole === "student" ? selectedStudent ?? undefined : undefined,
      });
      toast.success("User access updated");
    } catch (error) {
      console.error("Failed to update user access:", error);
      toast.error("Failed to update user access");
    } finally {
      setIsSaving(null);
    }
  };

  const handleRevoke = async (
    userId: Id<"users">,
    currentRole: RoleType,
    currentStudentId?: Id<"students">,
  ) => {
    const selectedRole = roleSelections[userId] || currentRole;
    const selectedStudent = studentSelections[userId] ?? currentStudentId ?? undefined;

    setIsRevoking(userId);
    try {
      await updateUserAccess({
        userId,
        role: selectedRole,
        status: "pending",
        studentId: selectedRole === "student" ? selectedStudent : undefined,
      });
      toast.success("User access revoked");
    } catch (error) {
      console.error("Failed to revoke user access:", error);
      toast.error("Failed to revoke user access");
    } finally {
      setIsRevoking(null);
    }
  };

  if (usersResponse === undefined) {
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

  if (usersResponse.status === "error") {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-12 text-center text-muted-foreground">
          Failed to load users. {usersResponse.error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">User Verification</CardTitle>
          <CardDescription>
            Review all users, confirm access, and link student accounts.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-muted"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | StatusType)
              }
            >
              <SelectTrigger className="w-40 bg-background/50 border-muted">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => {
                  const roleValue = roleSelections[user._id] || user.role;
                  const studentValue = studentSelections[user._id] ?? user.student ?? null;
                  const studentLabel = studentValue
                    ? getStudentLabel(studentValue)
                    : "Not linked";

                  return (
                    <TableRow
                      key={user._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={roleValue}
                          onValueChange={(value) => {
                            const newRole = value as RoleType;
                            setRoleSelections((prev) => ({
                              ...prev,
                              [user._id]: newRole,
                            }));

                            if (newRole !== "student") {
                              setStudentSelections((prev) => ({
                                ...prev,
                                [user._id]: null,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-32 bg-background/50 border-muted">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "default" : "secondary"}
                          className={
                            user.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-56">
                        {roleValue === "student" ? (
                          <Combobox
                            value={studentValue ?? null}
                            onValueChange={(value) =>
                              setStudentSelections((prev) => ({
                                ...prev,
                                [user._id]: value ? (value as Id<"students">) : null,
                              }))
                            }
                            itemToStringLabel={(value) =>
                              getStudentLabel(value as Id<"students">)
                            }
                            items={studentIds}
                          >
                            <ComboboxInput
                              className="w-56"
                              placeholder="Select student..."
                              showClear
                              disabled={
                                studentsResponse === undefined ||
                                studentsResponse.status === "error"
                              }
                            />
                            <ComboboxContent>
                              <ComboboxEmpty>
                                {studentsResponse === undefined
                                  ? "Loading students..."
                                  : "No students found."}
                              </ComboboxEmpty>
                              <ComboboxList>
                                {(item) => (
                                  <ComboboxItem key={item} value={item}>
                                    {getStudentLabel(item as Id<"students">)}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {studentLabel}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-sky-500 hover:bg-sky-600"
                            onClick={() => handleSave(user._id, user.student ?? undefined)}
                            disabled={
                              isSaving === user._id ||
                              (roleValue === "student" && !studentValue)
                            }
                          >
                            {isSaving === user._id ? "Saving..." : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRevoke(
                                user._id,
                                user.role,
                                user.student ?? undefined,
                              )
                            }
                            disabled={isRevoking === user._id}
                          >
                            {isRevoking === user._id ? "Revoking..." : "Revoke"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
