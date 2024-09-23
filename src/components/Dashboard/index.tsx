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
      filtered = filtered.filter(project => project.project_status.toLowerCase() === filter.toLowerCase());
    }
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    console.log('Filtered projects:', filtered); // Add this line for debugging
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

  const openPopup = (project) => {
    const projectChart = projectCharts[project.id];
    const tableSelection = JSON.parse(localStorage.getItem(`project_${project.id}_table`));
    const scorecardSelection = JSON.parse(localStorage.getItem(`project_${project.id}_scorecard`));
  
    if (tableSelection && tableSelection.selected) {
      router.push(`/tables?projectId=${project.id}`);
    } else if (scorecardSelection && scorecardSelection.selected) {
      router.push(`/scorecard?projectId=${project.id}`);
    }else if (projectChart && projectChart.specificType) {
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
    { name: 'Column Chart', icon: '📊', route: 'column-chart' },
    { name: 'Area Chart', icon: <img src="/images/chart/area-chart.png" alt="Area Chart" style={{ width: '24px', height: '24px' }} />, route: 'area-chart' },
    { name: 'Heat Map', icon: <img src="/images/chart/heatmap.png" alt="Heat Map" style={{ width: '24px', height: '24px' }} />, route: 'heat-map' }
  ];

  const tableOptions = [
    { name: 'Tables', icon: <img src="/images/chart/table.png" alt="Table" style={{ width: '24px', height: '24px' }} />, route: 'tables' },
  ];

  const scorecardOptions = [
    { name: 'Scorecard', icon: <img src="/images/chart/scorecard.png" alt="Scorecard" style={{ width: '24px', height: '24px' }} />, route: 'scorecard' },
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
      case 'column-chart':
        route = `/forms/column-chartTypes`;
        break;
      case 'area-chart':
        route = `/forms/area-chartTypes`;
        break;
      case 'heat-map':
        route = `/forms/heat-mapchartTypes`;
        break;
        case 'tables':
          route = `/tables`;
          // Save table selection to local storage
          localStorage.setItem(`project_${projectId}_table`, JSON.stringify({
            selected: true,
            timestamp: new Date().toISOString()
          }));
          break;
          case 'scorecard':
            route = `/scorecard`;
            // Save scorecard selection to local storage
            localStorage.setItem(`project_${projectId}_scorecard`, JSON.stringify({
              selected: true,
              timestamp: new Date().toISOString()
            }));
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
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Project Dashboard</h1>
        
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-4">
            {/* Search Projects */}
  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      Search Projects
    </h2>
    <div className="relative">
      <input
        type="text"
        className="w-full p-4 pl-12 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300"
        placeholder="Enter project name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-70 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

            
         {/* Visual Separator */}
  <div className="border-t-2 border-gray-200 my-8"></div>

{/* Create Project */}
<div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
    Create Project
  </h2>
  <input
    type="text"
    className="w-full p-4 mb-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300"
    placeholder="Project Name"
    value={newProjectName}
    onChange={(e) => setNewProjectName(e.target.value)}
  />
  <textarea
    className="w-full p-4 mb-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300"
    placeholder="Project Description"
    rows={4}
    value={newProjectDescription}
    onChange={(e) => setNewProjectDescription(e.target.value)}
  />
  <button
    onClick={createProject}
    className="w-full py-4 px-6 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
  >
    Create Project
  </button>
</div>
</div>
          
          {/* Center Column */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Projects</h2>
              <div className="grid grid-cols-3 gap-6">
                {currentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                    onClick={() => openPopup(project)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-75 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="relative p-6 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">{project.name}</h3>
                        <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                          {project.description ? project.description.slice(0, 50) + '...' : 'No description'}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          project.project_status === 'Published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {project.project_status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 flex justify-center">
  <nav className="relative z-0 inline-flex rounded-xl shadow-lg bg-white p-2" aria-label="Pagination">
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className="relative inline-flex items-center px-3 py-2 rounded-lg mr-2 text-sm font-medium text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      <span className="sr-only">Previous</span>
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </button>
    <div className="hidden sm:flex space-x-2">
      {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerPage) }).map((_, index) => (
        <button
          key={index}
          onClick={() => paginate(index + 1)}
          className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${currentPage === index + 1 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110' 
              : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 shadow-sm hover:shadow'
            }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
    <div className="sm:hidden flex items-center px-4 py-2 text-sm font-medium text-gray-700">
      Page {currentPage} of {Math.ceil(filteredProjects.length / projectsPerPage)}
    </div>
    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === Math.ceil(filteredProjects.length / projectsPerPage)}
      className="relative inline-flex items-center px-3 py-2 rounded-lg ml-2 text-sm font-medium text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      <span className="sr-only">Next</span>
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  </nav>
</div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="col-span-3">
            {/* Filter Projects */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
    Filter Projects
  </h2>
  <div className="relative">
    <select
      className="w-full p-4 bg-white rounded-lg text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all" className="text-gray-800 bg-white hover:bg-gray-100">All Projects</option>
      <option value="Draft" className="text-gray-800 bg-white hover:bg-gray-100">Draft Projects</option>
      <option value="Published" className="text-gray-800 bg-white hover:bg-gray-100">Published Projects</option>
    </select>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
</div>
        </div>

        
  
      {/* Error Popup */}
{showErrorPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Error</h2>
        <button
          onClick={() => setShowErrorPopup(false)}
          className="text-gray-400 hover:text-gray-600 transition duration-300 ease-in-out"
          aria-label="Close"
        >
          
        </button>
      </div>
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{errorMessage}</p>
      </div>
      <button
  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
  onClick={() => setShowErrorPopup(false)}
>
  <span className="flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
    Close
  </span>
</button>
    </div>
  </div>
)}
  
  {showPopup && selectedProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select for {selectedProject.name}</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Charts</h3>
          <div className="grid grid-cols-3 gap-3">
            {chartOptions.map((option, index) => (
              <button
                key={index}
                className="p-3 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center transition duration-300 ease-in-out"
                onClick={() => selectChartForProject(selectedProject.id, option.route)}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-start">
  <div className="w-[30%]">
    <h3 className="text-xl font-semibold text-gray-700 mb-3">Tables</h3>
    <div className="grid grid-cols-1 gap-3">
      {tableOptions.map((option, index) => (
        <button
          key={index}
          className="p-3 border border-gray-300 rounded-md hover:bg-green-50 hover:border-green-300 flex flex-col items-center transition duration-300 ease-in-out"
          onClick={() => selectChartForProject(selectedProject.id, option.route)}
        >
          <span className="text-2xl mb-1">{option.icon}</span>
          <span className="text-sm font-medium text-gray-700">{option.name}</span>
        </button>
      ))}
    </div>
  </div>
  
  <div className="w-[30%] flex flex-col items-center">
    <h3 className="text-xl font-semibold text-gray-700 mb-3">Scorecard</h3>
    <div className="w-full grid grid-cols-1 gap-3">
      {scorecardOptions.map((option, index) => (
        <button
          key={index}
          className="p-3 border border-gray-300 rounded-md hover:bg-yellow-50 hover:border-yellow-300 flex flex-col items-center transition duration-300 ease-in-out"
          onClick={() => selectChartForProject(selectedProject.id, option.route)}
        >
          <span className="text-2xl mb-1">{option.icon}</span>
          <span className="text-sm font-medium text-gray-700">{option.name}</span>
        </button>
      ))}
    </div>
  </div>
  
  <div className="w-[30%]">
    <h3 className="text-xl font-semibold text-gray-700 mb-3">Maps</h3>
    <div className="grid grid-cols-1 gap-3">
      {mapOptions.map((option, index) => (
        <button
          key={index}
          className="p-3 border border-gray-300 rounded-md hover:bg-green-50 hover:border-green-300 flex flex-col items-center transition duration-300 ease-in-out"
          onClick={() => selectChartForProject(selectedProject.id, option.route)}
        >
          <span className="text-2xl mb-1">{option.icon}</span>
          <span className="text-sm font-medium text-gray-700">{option.name}</span>
        </button>
      ))}
    </div>
  </div>
</div>
      </div>
      
      <div className="bg-gray-100 px-6 py-4 flex justify-end">
        <button
          className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300 ease-in-out"
          onClick={closePopup}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
</div>
</div>
);
};

export default Dashboard;