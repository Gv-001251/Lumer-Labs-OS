"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Video,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { Project, ProjectStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionModals } from "@/components/modals/ActionModals";

export default function ProjectsPage() {
  const { projects, updateProjectStatus, deleteProject } = useLumer();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Planned":
        return "bg-blue-100 text-blue-700 border-blue-200/80";
      case "In Progress":
        return "bg-purple-100 text-purple-700 border-purple-200/80";
      case "Awaiting Approval":
        return "bg-amber-100 text-amber-700 border-amber-200/80";
      case "Delivered":
        return "bg-indigo-100 text-indigo-700 border-indigo-200/80";
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Projects & Shoot Pipeline
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track video productions, shoot logistics, editing workflows, and delivery deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Project / Shoot
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {(["All", "Planned", "In Progress", "Awaiting Approval", "Delivered", "Completed"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Dedicated Video Shoot Schedule Highlight Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 via-slate-50 to-pink-50/40 border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 text-white shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Active Video Shoots Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">On-location production, camera crews & equipment</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-zinc-900 border border-slate-200 shadow-xs">
            {projects.filter((p) => p.shootDetails).length} Active Shoots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects
            .filter((p) => p.shootDetails)
            .map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{project.title}</h4>
                    <span className="text-[11px] text-violet-600 font-bold">{project.clientName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                    {project.shootDetails?.deliveryStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{project.shootDetails?.shootDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{project.shootDetails?.timeSlot}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.shootDetails?.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 font-medium">
                  <span className="text-slate-500">
                    Shoot: <strong className="text-slate-900">{formatCurrency(project.shootDetails?.shootCost || 0)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Edit: <strong className="text-slate-900">{formatCurrency(project.shootDetails?.editingCost || 0)}</strong>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-xs card-hover space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
                    {project.serviceType}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{project.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">{project.clientName}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadge(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due {formatDate(project.dueDate)}</span>
              </div>
              <span className="font-extrabold text-slate-900">{formatCurrency(project.budget)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider block">
                    {selectedProject.serviceType} — {selectedProject.clientName}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">{selectedProject.title}</h2>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                    selectedProject.status
                  )}`}
                >
                  {selectedProject.status}
                </span>
              </div>

              {/* Status Update Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">Update Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["Planned", "In Progress", "Awaiting Approval", "Delivered", "Completed"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateProjectStatus(selectedProject.id, st);
                          setSelectedProject({ ...selectedProject, status: st });
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          selectedProject.status === st
                            ? "bg-zinc-900 text-white shadow-xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Shoot Specs if present */}
              {selectedProject.shootDetails && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
                  <span className="font-extrabold text-purple-900 block flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-violet-600" /> Shoot Specifications & Logistics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                    <div>Date: {selectedProject.shootDetails.shootDate} ({selectedProject.shootDetails.timeSlot})</div>
                    <div>Location: {selectedProject.shootDetails.location}</div>
                    <div>Shoot Cost: {formatCurrency(selectedProject.shootDetails.shootCost)}</div>
                    <div>Editing Cost: {formatCurrency(selectedProject.shootDetails.editingCost)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Equipment Checklist:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProject.shootDetails.equipment.map((eq) => (
                        <span key={eq} className="px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Financials */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-medium block">Project Budget</span>
                  <span className="text-base font-extrabold text-slate-900">{formatCurrency(selectedProject.budget)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-medium block">Actual Cost</span>
                  <span className="text-base font-extrabold text-slate-700">{formatCurrency(selectedProject.actualCost)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => {
                    deleteProject(selectedProject.id);
                    setSelectedProject(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                >
                  Delete Project
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      <ActionModals modalType={isAddModalOpen ? "project" : null} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
