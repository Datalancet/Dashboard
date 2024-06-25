"use client";
import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("Draft");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch projects from the API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/list/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on the selected filter and search query
  useEffect(() => {
    let filtered = projects;
    if (filter !== "all") {
      filtered = filtered.filter(project => project.project_status === filter);
    }
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProjects(filtered);
  }, [filter, searchQuery, projects]);

  const createProject = async () => {
    if (!newProjectName || !newProjectDescription) {
      alert('Name and description are required.');
      return;
    }

    try {
      // Fetch demo.html file and encode it to base64
      const htmlResponse = await fetch('/public/demo.html');
      const htmlText = await htmlResponse.text();
      const htmlBase64 = btoa(htmlText);

      // Fetch Data.csv file and encode it to base64
      const csvResponse = await fetch('/Data.csv');
      const csvText = await csvResponse.text();
      const csvBase64 = btoa(csvText);

      const formData = new FormData();
      formData.append('name', newProjectName);
      formData.append('description', newProjectDescription);
      formData.append('html_file', htmlBase64);
      formData.append('data_file', csvBase64);
      formData.append('project_status', projectStatus);
      formData.append('selected_column', JSON.stringify([]));

      console.log('Creating project with data:', Object.fromEntries(formData.entries()));

      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error('Network response was not ok');
      }

      const createdProject = await response.json();
      console.log('Created project:', createdProject);

      const updatedProjects = [...projects, createdProject];
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects.filter(project => filter === "all" || project.project_status === filter));

      // Clear the form
      setNewProjectName("");
      setNewProjectDescription("");
      setProjectStatus("Draft");
    } catch (error) {
      console.error('Error creating project:', error.message);
    }
  };


  const deleteProject = async (id: number) => {
    try {
      const response = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/delete/?id=${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Delete result:', result);

      // Update projects list after deletion
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects.filter(project => filter === "all" || project.project_status === filter));
    } catch (error) {
      console.error('Error deleting project:', error.message);
    }
  };

  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-3">
          <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white mb-4">
            <h2 className="text-lg font-semibold mb-2">Search Projects</h2>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">Create Project</h2>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
              placeholder="Project Description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
            />
            <button
              onClick={createProject}
              className="w-full p-2 border border-gray-300 rounded-md bg-blue-500 text-white"
            >
              Create Project
            </button>
          </div>
        </div>

        <div className="col-span-6">
          <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">My Projects</h2>
            <div className="grid grid-cols-3 gap-2">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 flex justify-between items-center relative"
                  style={{ width: '100px', height: '100px' }}
                >
                  <span className="truncate">{project.name}</span>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="absolute bottom-1 right-1 text-red-500 hover:text-red-700"
                    style={{ width: '16px', height: '16px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="16px" height="16px">
                      <path
                        d="M 11 -0.03125 C 10.164063 -0.03125 9.34375 0.132813 8.75 0.71875 C 8.15625 1.304688 7.96875 2.136719 7.96875 3 L 4 3 C 3.449219 3 3 3.449219 3 4 L 2 4 L 2 6 L 24 6 L 24 4 L 23 4 C 23 3.449219 22.550781 3 22 3 L 18.03125 3 C 18.03125 2.136719 17.84375 1.304688 17.25 0.71875 C 16.65625 0.132813 15.835938 -0.03125 15 -0.03125 Z M 11 2.03125 L 15 2.03125 C 15.546875 2.03125 15.71875 2.160156 15.78125 2.21875 C 15.84375 2.277344 15.96875 2.441406 15.96875 3 L 10.03125 3 C 10.03125 2.441406 10.15625 2.277344 10.21875 2.21875 C 10.28125 2.160156 10.453125 2.03125 11 2.03125 Z M 4 7 L 4 23 C 4 24.652344 5.347656 26 7 26 L 19 26 C 20.652344 26 22 24.652344 22 23 L 22 7 Z M 8 10 L 10 10 L 10 22 L 8 22 Z M 12 10 L 14 10 L 14 22 L 12 22 Z M 16 10 L 18 10 L 18 22 L 16 22 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white mb-4">
            <h2 className="text-lg font-semibold mb-2">Show Projects</h2>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Show All Projects</option>
              <option value="Draft">Show Draft Projects</option>
              <option value="Published">Show Published Projects</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
