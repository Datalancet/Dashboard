"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("Draft");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectCharts, setProjectCharts] = useState({});
  const router = useRouter();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  const fetchProjects = async () => {
    try {
      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/list/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
      
      const savedCharts = JSON.parse(localStorage.getItem('projectCharts') || '{}');
      setProjectCharts(savedCharts);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber: React.SetStateAction<number>) => setCurrentPage(pageNumber);

  const createProject = async () => {
    if (!newProjectName.trim() || !newProjectDescription.trim()) {
      setErrorMessage('Please fill in both project name and description.');
      setShowErrorPopup(true);
      return;
    }

    try {
      const htmlResponse = await fetch('/demo.html');
      const htmlContent = await htmlResponse.text();
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      
      const csvResponse = await fetch('/Data.csv');
      const csvContent = await csvResponse.text();
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('name', newProjectName);
      formData.append('description', newProjectDescription);
      formData.append('html_file', htmlBlob, 'demo.html');
      formData.append('data_file', csvBlob, 'Data.csv');
      formData.append('project_status', projectStatus);
      
      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log('Project created:', result);
      
      await fetchProjects();
      
      const newProject = projects.find(p => p.id === result.id);
      
      setNewProjectName("");
      setNewProjectDescription("");
      setProjectStatus("Draft");
      
      if (newProject) {
        setSelectedProject(newProject);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage('An error occurred while creating the project. Please try again.');
      setShowErrorPopup(true);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      const response = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/delete/?id=${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Delete result:', result);

      await fetchProjects();
      
      const updatedCharts = { ...projectCharts };
      delete updatedCharts[id];
      setProjectCharts(updatedCharts);
      localStorage.setItem('projectCharts', JSON.stringify(updatedCharts));
    } catch (error) {
      console.error('Error deleting project:', error.message);
    }
  };

  const openPopup = (project: React.SetStateAction<null>) => {
    const projectChart = projectCharts[project.id];
    if (projectChart && projectChart.specificType) {
      router.push(`/forms/${projectChart.specificType}?projectId=${project.id}`);
    } else if (projectChart && projectChart.generalType) {
      router.push(`/forms/form-elements?projectId=${project.id}&chartType=${projectChart.generalType}`);
    } else {
      setSelectedProject(project);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedProject(null);
  };

  const chartOptions = [
    { name: 'Bar Chart', icon: <img src="/images/chart/horizontal bar-graph.png" alt="Bar Chart" style={{ width: '24px', height: '24px' }} />, route: 'bar-chart' },
    { name: 'Pie Chart', icon: <img src="/images/chart/pie-chart.png" alt="Pie Chart" style={{ width: '24px', height: '24px' }} />, route: 'pie-chart' },
    { name: 'Line Chart', icon: '📈', route: 'line-chart' },
    { name: 'Column & Line Chart', icon: '📊', route: 'column-line-chart' },
    { name: 'Area Chart', icon: <img src="/images/chart/area-chart.png" alt="Area Chart" style={{ width: '24px', height: '24px' }} />, route: 'area-chart' },
    { name: 'Waterfall Chart', icon: <img src="/images/chart/waterfall-chart.png" alt="Waterfall Chart" style={{ width: '24px', height: '24px' }} />, route: 'waterfall-chart' }
  ];

  const mapOptions = [
    { name: 'Maps', icon: '🗺️', route: 'maps' },
  ];

  const selectChartForProject = (projectId, generalType) => {
    const updatedCharts = { 
      ...projectCharts, 
      [projectId]: { generalType, specificType: null } 
    };
    setProjectCharts(updatedCharts);
    localStorage.setItem('projectCharts', JSON.stringify(updatedCharts));
  
    let route;
    switch (generalType) {
      case 'bar-chart':
        route = `/forms/form-elements`;
        break;
      case 'pie-chart':
        route = `/forms/form-layout`;
        break;
      case 'line-chart':
        route = `/forms/line-chartTypes`;
        break;
      case 'column-line-chart':
        route = `/forms/column-line-chartTypes`;
        break;
      case 'area-chart':
        route = `/forms/area-chartTypes`;
        break;
      case 'waterfall-chart':
        route = `/forms/waterfall-chartTypes`;
        break;
      case 'maps':
        route = `/forms/map-types`;
        break;
      default:
        route = `/forms/chart-types`;
    }
  
    router.push(`${route}?projectId=${projectId}&chartType=${generalType}`);
    closePopup();
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

        {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="mb-4">{errorMessage}</p>
            <button
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setShowErrorPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


<div className="col-span-6">
          <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">My Projects</h2>
            <div className="grid grid-cols-3 gap-2">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 flex flex-col justify-between items-center relative cursor-pointer"
                  style={{ width: '100px', height: '100px' }}
                  onClick={() => openPopup(project)}
                >
                  <span className="truncate">{project.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="absolute bottom-1 right-1 text-red-500 hover:text-red-700"
                    style={{ width: '16px', height: '16px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="16px" height="16px">
                      <path d="M 11 -0.03125 C 10.164063 -0.03125 9.34375 0.132813 8.75 0.71875 C 8.15625 1.304688 7.96875 2.136719 7.96875 3 L 4 3 C 3.449219 3 3 3.449219 3 4 L 2 4 L 2 6 L 24 6 L 24 4 L 23 4 C 23 3.449219 22.550781 3 22 3 L 18.03125 3 C 18.03125 2.136719 17.84375 1.304688 17.25 0.71875 C 16.65625 0.132813 15.835938 -0.03125 15 -0.03125 Z M 11 2.03125 L 15 2.03125 C 15.546875 2.03125 15.71875 2.160156 15.78125 2.21875 C 15.84375 2.277344 15.96875 2.441406 15.96875 3 L 10.03125 3 C 10.03125 2.441406 10.15625 2.277344 10.21875 2.21875 C 10.28125 2.160156 10.453125 2.03125 11 2.03125 Z M 4 7 L 4 23 C 4 24.652344 5.347656 26 7 26 L 19 26 C 20.652344 26 22 24.652344 22 23 L 22 7 Z M 8 10 L 10 10 L 10 22 L 8 22 Z M 12 10 L 14 10 L 14 22 L 12 22 Z M 16 10 L 18 10 L 18 22 L 16 22 Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  &#8592;
                </button>
                {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === index + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredProjects.length / projectsPerPage)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  &#8594;
                </button>
              </nav>
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

      {showPopup && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Select a Chart or Map for {selectedProject.name}</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Charts</h3>
              <div className="grid grid-cols-3 gap-4">
                {chartOptions.map((option, index) => (
                  <button
                    key={index}
                    className="p-4 border border-gray-300 rounded-md hover:bg-gray-100 flex flex-col items-center"
                    onClick={() => selectChartForProject(selectedProject.id, option.route)}
                  >
                    <span className="text-3xl mb-2">{option.icon}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Maps</h3>
              <div className="grid grid-cols-3 gap-4">
                {mapOptions.map((option, index) => (
                  <button
                    key={index}
                    className="p-4 border border-gray-300 rounded-md hover:bg-gray-100 flex flex-col items-center"
                    onClick={() => selectChartForProject(selectedProject.id, option.route)}
                  >
                    <span className="text-3xl mb-2">{option.icon}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              className="mt-6 p-2 bg-gray-300 rounded-md hover:bg-gray-400"
              onClick={closePopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
