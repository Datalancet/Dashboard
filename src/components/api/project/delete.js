let projects = [
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

export function deleteProjectById(id) {
    const projectIndex = projects.findIndex(project => project.id === parseInt(id, 10));
    if (projectIndex > -1) {
        projects.splice(projectIndex, 1);
        return {
            status: 200,
            message: "Project was successfully deleted."
        };
    } else {
        return {
            status: 404,
            message: "Project not found."
        };
    }
}
