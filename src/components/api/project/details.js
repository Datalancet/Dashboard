const projects = [
    {
        "id": 1,
        "name": "Sample Project",
        "description": "This is a sample project.",
        "project_status": "Draft",
        "modified_date": "2024-05-28T12:00:00Z"
    },
    {
        "id": 2,
        "name": "Another Project",
        "description": "This is another project.",
        "project_status": "Published",
        "modified_date": "2024-05-27T10:30:00Z"
    }
];

async function searchProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const data = {
            project_data: project,
            html_file: btoa("<base64_encoded_html_content>"), // Replace with actual HTML content
            data_file: btoa("<base64_encoded_data_content>") // Replace with actual data content
        };
        displayProjectData(data);
    } else {
        const errorData = { message: "Project not found." };
        displayErrorMessage(errorData.message);
    }
}

function displayProjectData(data) {
    const project = data.project_data;
    console.log('Project ID:', project.id);
    console.log('Project Name:', project.name);
    console.log('Project Description:', project.description);
    console.log('Project Status:', project.project_status);
    console.log('Last Modified Date:', project.modified_date);

    // Decode and display the HTML content if needed
    const htmlContent = atob(data.html_file);
    console.log('HTML Content:', htmlContent);

    // Decode and process the data file if needed
    const dataContent = atob(data.data_file);
    console.log('Data File Content:', dataContent);

    // Additional display logic can go here
}

function displayErrorMessage(message) {
    console.error('Error:', message);
}

export { searchProject, projects };
