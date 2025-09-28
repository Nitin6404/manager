"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createCompany } from "../apis/createCompany";
import { getCompany } from "../apis/getCompany";
import { createProject } from "../apis/createProject";
import { getProject } from "../apis/getProject";
import { createTask } from "../apis/createTask";
import { getTask } from "../apis/getTask";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const HARDCODED_MEMBER_ID = "68d90de934df604dbea76475";

const taskColumns = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "eta",
    header: "ETA",
    cell: (info) =>
      info.getValue() ? new Date(info.getValue()).toLocaleString() : "N/A",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: (info) => info.getValue() || "-",
  },
];

export default function Dashboard() {
  // Company dialog state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Company list state
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(null);

  // Project dialog & form state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [members, setMembers] = useState([""]);

  // Accordion for projects
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);
  const [projectsByCompany, setProjectsByCompany] = useState({});
  const [projectsLoading, setProjectsLoading] = useState({});
  const [projectsError, setProjectsError] = useState({});

  // Tasks state per selected project
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Task dialog & form state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskEta, setTaskEta] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskSaveError, setTaskSaveError] = useState(null);

  // Reset forms
  const resetCompanyForm = useCallback(() => {
    setName("");
    setDescription("");
  }, []);
  const resetProjectForm = useCallback(() => {
    setProjectName("");
    setProjectDescription("");
    setMembers([""]);
    setSelectedCompany("");
  }, []);
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignedTo("");
    setTaskEta("");
    setTaskProjectId("");
    setTaskSaveError(null);
  };

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setLoadErr(null);
      const res = await getCompany();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCompanies(
        list.map((item) => ({
          id: item.id ?? item._id ?? item.uuid ?? item.name,
          name: item.name ?? "",
          description: item.description ?? "",
        }))
      );
    } catch (e) {
      setLoadErr(e?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSaveCompany = useCallback(async () => {
    if (!name?.trim()) {
      console.warn("Company name is required");
      return;
    }
    try {
      setSaving(true);
      const body = {
        name: name.trim(),
        description: description?.trim() || "",
        userId: HARDCODED_MEMBER_ID,
      };
      await createCompany({ data: body });
      resetCompanyForm();
      setOpen(false);
      fetchCompanies();
    } finally {
      setSaving(false);
    }
  }, [name, description, resetCompanyForm, fetchCompanies]);

  // Project member input handlers
  const handleAddMemberInput = () => setMembers((prev) => [...prev, ""]);
  const handleRemoveMemberInput = (index) =>
    setMembers((prev) => prev.filter((_, i) => i !== index));
  const handleChangeMember = (value, index) =>
    setMembers((prev) => prev.map((m, i) => (i === index ? value : m)));

  // Save project
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      console.warn("Project name is required");
      return;
    }
    if (!selectedCompany) {
      console.warn("Please select a company");
      return;
    }
    try {
      setSaving(true);
      const body = {
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
        companyId: selectedCompany,
        members: [
          HARDCODED_MEMBER_ID,
          ...members.filter((m) => m.trim() !== ""),
        ],
      };
      await createProject({ data: body });
      resetProjectForm();
      setProjectDialogOpen(false);

      setProjectsByCompany((prev) => ({ ...prev, [selectedCompany]: null }));
      handleAccordionClick(selectedCompany);
    } finally {
      setSaving(false);
    }
  };

  // Accordion and fetch projects
  const handleAccordionClick = async (companyId) => {
    const isExpanded = expandedCompanyId === companyId;
    setExpandedCompanyId(isExpanded ? null : companyId);
    if (!isExpanded && !projectsByCompany[companyId]) {
      try {
        setProjectsLoading((pl) => ({ ...pl, [companyId]: true }));
        setProjectsError((pe) => ({ ...pe, [companyId]: null }));

        const response = await getProject(companyId);
        let projectList = [];
        if (Array.isArray(response)) projectList = response;
        else if (Array.isArray(response?.data)) projectList = response.data;
        else if (response) projectList = [response];
        setProjectsByCompany((pc) => ({ ...pc, [companyId]: projectList }));
      } catch (e) {
        setProjectsError((pe) => ({
          ...pe,
          [companyId]: e?.message || "Failed to load projects",
        }));
      } finally {
        setProjectsLoading((pl) => ({ ...pl, [companyId]: false }));
      }
    }
  };

  // Load tasks for project
  const loadTasks = async (projectId) => {
    if (!projectId) return;
    setTasksLoading(true);
    setTasksError(null);
    setSelectedProjectId(projectId);
    try {
      const res = await getTask(projectId);
      setTasks(Array.isArray(res) ? res : res ? [res] : []);
    } catch (e) {
      setTasksError(e?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Open task dialog with project ID
  const openTaskDialog = (projectId) => {
    resetTaskForm();
    setTaskProjectId(projectId);
    setTaskDialogOpen(true);
  };

  // Save task
  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      console.warn("Task title is required");
      return;
    }
    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      projectId: taskProjectId,
      eta: taskEta ? new Date(taskEta).toISOString() : null,
    };
    if (taskAssignedTo.trim()) {
      taskData.assignedTo = taskAssignedTo.trim();
    }
    try {
      setTaskSaving(true);
      setTaskSaveError(null);
      await createTask({ data: taskData });
      setTaskDialogOpen(false);
      resetTaskForm();
      loadTasks(taskProjectId);
    } catch (error) {
      setTaskSaveError(error.message || "Failed to save task");
    } finally {
      setTaskSaving(false);
    }
  };

  // Setup table instance for tasks
  const table = useReactTable({
    data: tasks || [],
    columns: taskColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Sidebar with companies and projects */}
      <div className="md:w-[206px] relative">
        <header className="sticky top-0 bg-white">
          <div className="h-12 flex items-center gap-9 px-3">
            <h1 className="text-[15px] font-semibold leading-none mr-4">
              Home
            </h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 px-3">
                  <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
                  <span className="text-sm">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create a Company</DialogTitle>
                  <DialogDescription>
                    A company delivering innovative solutions with customized
                    services and expertise.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      placeholder="Enter company name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Add a short description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={saving}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button onClick={handleSaveCompany} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <p className="text-[12px] font-semibold leading-none">Company</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={fetchCompanies}
              disabled={loading}
              aria-label="Refresh companies"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </header>
        <div
          className="px-3 pb-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 5rem)" }}
        >
          {loading ? (
            <p className="text-xs text-neutral-500">Loading companies...</p>
          ) : loadErr ? (
            <p className="text-xs text-red-600">Error: {loadErr}</p>
          ) : companies.length === 0 ? (
            <p className="text-xs text-neutral-500">No companies found.</p>
          ) : (
            <ul className="space-y-1">
              {companies.map((c) => (
                <li key={c.id}>
                  <div
                    className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 cursor-pointer"
                    onClick={() => handleAccordionClick(c.id)}
                    title={c.description || c.name}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {expandedCompanyId === c.id ? (
                        <ChevronDown className="w-5 h-5 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-neutral-500" />
                      )}
                      <span className="truncate text-sm text-neutral-800">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="More options"
                        title="More"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompany(c.id);
                          setProjectDialogOpen(true);
                        }}
                        aria-label={`Create project for ${c.name}`}
                        title="Create project"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedCompanyId === c.id && (
                    <div className="pl-8 pr-2 pt-2 pb-2 bg-neutral-50 border-l border-neutral-200 rounded-b">
                      {projectsLoading[c.id] ? (
                        <p className="text-xs text-neutral-400">
                          Loading projects...
                        </p>
                      ) : projectsError[c.id] ? (
                        <p className="text-xs text-red-600">
                          Error: {projectsError[c.id]}
                        </p>
                      ) : (projectsByCompany[c.id]?.length ?? 0) === 0 ? (
                        <p className="text-xs text-neutral-500">
                          No projects found.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {projectsByCompany[c.id].map((proj) => (
                            <li
                              key={proj.id || proj._id || proj.projectName}
                              className="border border-neutral-200 rounded px-3 py-2 text-sm bg-white flex justify-between items-center"
                            >
                              <div
                                className="cursor-pointer"
                                onClick={() =>
                                  loadTasks(proj.id || proj._id || "")
                                }
                              >
                                <div className="font-semibold">
                                  {proj.projectName}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  openTaskDialog(proj.id || proj._id || "")
                                }
                                aria-label={`Add task to ${proj.projectName}`}
                                title="Add Task"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="w-[1px] bg-gray-200" />

      {/* Main panel shows tasks for selected project */}
      <main className="flex-1 min-h-[calc(100vh-1px)] bg-white text-black p-4 overflow-auto">
        {selectedProjectId ? (
          <>
            <h2 className="text-xl font-bold mb-4">Tasks</h2>
            <Button
              onClick={() => openTaskDialog(selectedProjectId)}
              className="mb-4"
            >
              + Add New Task
            </Button>

            {tasksLoading ? (
              <p>Loading tasks ...</p>
            ) : tasksError ? (
              <p className="text-red-600">Error: {tasksError}</p>
            ) : tasks.length === 0 ? (
              <p>No tasks found for this project.</p>
            ) : (
              <div className="rounded border border-gray-200 overflow-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {!header.isPlaceholder &&
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <p>Select a project to view its tasks.</p>
        )}
      </main>

      {/* Project Creation Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Project</DialogTitle>
            <DialogDescription>
              Fill out project details and assign company and members.
              <br />
              <span className="text-xs text-neutral-500">
                Note: Member <code>{HARDCODED_MEMBER_ID}</code> will be added
                automatically.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project_description">Project Description</Label>
              <Textarea
                id="project_description"
                rows={3}
                placeholder="Add project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Company</Label>
              <Input
                value={
                  companies.find((c) => c.id === selectedCompany)?.name || ""
                }
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label>Members</Label>
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter member (optional)"
                    value={member}
                    onChange={(e) => handleChangeMember(e.target.value, index)}
                  />
                  {members.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveMemberInput(index)}
                      aria-label="Remove member"
                    >
                      &times;
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddMemberInput}
                className="w-full"
              >
                + Add Member
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveProject} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Creation Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Task</DialogTitle>
            <DialogDescription>Fill out task details below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="task_title">Title</Label>
              <Input
                id="task_title"
                placeholder="Enter task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task_description">Description</Label>
              <Textarea
                id="task_description"
                rows={3}
                placeholder="Enter task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task_assignedTo">Assign To (Optional)</Label>
              <Input
                id="task_assignedTo"
                placeholder="Assignee"
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task_eta">ETA</Label>
              <Input
                id="task_eta"
                type="datetime-local"
                value={taskEta}
                onChange={(e) => setTaskEta(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={taskSaving}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveTask}
              disabled={!taskTitle.trim() || taskSaving}
            >
              {taskSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
          {taskSaveError && (
            <p className="text-xs text-red-600 px-4">{taskSaveError}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
