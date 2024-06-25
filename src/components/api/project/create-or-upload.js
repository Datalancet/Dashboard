
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { name, description, html_file, data_file, project_status, selected_column } = req.body;
  
    // Validate the request body
    if (!name || !description || !html_file || !data_file) {
      return res.status(400).json({ message: 'File, name, and description are required.' });
    }
  
    // Prepare the payload for the API request
    const payload = {
      name,
      description,
      html_file,
      data_file,
      project_status,
      selected_column,
    };
  
    try {
      // Make the API request to the external endpoint
      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ message: errorData.message });
      }
  
      const responseData = await response.json();
      return res.status(201).json({
        message: 'File uploaded successfully.',
        embed_url: responseData.embed_url,
      });
    } catch (error) {
      console.error('Error uploading project:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  