const { pineconeIndex } = require('../utils/pinecone');

// Convert communication data to vector representation
const communicationToVector = (communication) => {
  // This is a simplified example - in a real application, you would use an embedding model
  // to convert communication details into vectors
  const vector = new Array(1536).fill(0);
  
  // Simple hash-based approach for demonstration
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  
  // Create a simple vector representation based on communication properties
  const text = `${communication.type || ''} ${communication.subject || ''} ${communication.content || ''} ${communication.recipient || ''}`.toLowerCase();
  for (let i = 0; i < Math.min(10, text.length); i++) {
    const index = hash(text.substring(i, i + 5)) % 1536;
    vector[index] = (vector[index] || 0) + 1;
  }
  
  return vector;
};

// In-memory communication storage (in production, you might want to use a database)
let communications = {};
let nextCommunicationId = 1;

// Get all communications
exports.getAllCommunications = async (req, res) => {
  try {
    const communicationList = Object.values(communications);
    res.json(communicationList);
  } catch (error) {
    console.error("Error fetching communications:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get communication by ID
exports.getCommunicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const communication = communications[id];
    
    if (!communication) {
      return res.status(404).json({ error: "Communication not found" });
    }
    
    res.json(communication);
  } catch (error) {
    console.error("Error fetching communication:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create new communication
exports.createCommunication = async (req, res) => {
  try {
    const communicationData = req.body;
    const communicationId = `comm_${nextCommunicationId++}`;
    
    const communication = {
      id: communicationId,
      ...communicationData,
      status: 'pending', // Default status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    communications[communicationId] = communication;
    
    // Also save to Pinecone
    try {
      const vector = communicationToVector(communication);
      const metadata = {
        ...communication,
        communicationId: communicationId,
        createdAt: communication.createdAt,
        updatedAt: communication.updatedAt
      };
      
      await pineconeIndex.upsert([{
        id: communicationId,
        values: vector,
        metadata: metadata
      }]);
    } catch (pineconeError) {
      console.error('Error saving communication to Pinecone:', pineconeError);
      // Don't fail the request if Pinecone fails, just log the error
    }
    
    res.status(201).json(communication);
  } catch (error) {
    console.error("Error creating communication:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update communication
exports.updateCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const communicationData = req.body;
    
    if (!communications[id]) {
      return res.status(404).json({ error: "Communication not found" });
    }
    
    const updatedCommunication = {
      ...communications[id],
      ...communicationData,
      id: id,
      updatedAt: new Date().toISOString()
    };
    
    communications[id] = updatedCommunication;
    
    // Also update in Pinecone
    try {
      const vector = communicationToVector(updatedCommunication);
      const metadata = {
        ...updatedCommunication,
        communicationId: id,
        updatedAt: updatedCommunication.updatedAt
      };
      
      await pineconeIndex.upsert([{
        id: id,
        values: vector,
        metadata: metadata
      }]);
    } catch (pineconeError) {
      console.error('Error updating communication in Pinecone:', pineconeError);
      // Don't fail the request if Pinecone fails, just log the error
    }
    
    res.json(updatedCommunication);
  } catch (error) {
    console.error("Error updating communication:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete communication
exports.deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!communications[id]) {
      return res.status(404).json({ error: "Communication not found" });
    }
    
    delete communications[id];
    
    // Also delete from Pinecone
    try {
      await pineconeIndex.deleteOne(id);
    } catch (pineconeError) {
      console.error('Error deleting communication from Pinecone:', pineconeError);
      // Don't fail the request if Pinecone fails, just log the error
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting communication:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send communication (simulate sending)
exports.sendCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!communications[id]) {
      return res.status(404).json({ error: "Communication not found" });
    }
    
    communications[id].status = 'sent';
    communications[id].sentAt = new Date().toISOString();
    communications[id].updatedAt = new Date().toISOString();
    
    // Also update in Pinecone
    try {
      const vector = communicationToVector(communications[id]);
      const metadata = {
        ...communications[id],
        communicationId: id,
        updatedAt: communications[id].updatedAt
      };
      
      await pineconeIndex.upsert([{
        id: id,
        values: vector,
        metadata: metadata
      }]);
    } catch (pineconeError) {
      console.error('Error updating communication status in Pinecone:', pineconeError);
      // Don't fail the request if Pinecone fails, just log the error
    }
    
    res.json(communications[id]);
  } catch (error) {
    console.error("Error sending communication:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search communications by subject or content
exports.searchCommunications = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const matchingCommunications = Object.values(communications).filter(comm => 
      (comm.subject && comm.subject.toLowerCase().includes(query.toLowerCase())) ||
      (comm.content && comm.content.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json(matchingCommunications);
  } catch (error) {
    console.error("Error searching communications:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search similar communications using vector similarity
exports.searchSimilarCommunications = async (req, res) => {
  try {
    const { query, topK = 10 } = req.body;
    
    // Convert query to vector
    const queryVector = communicationToVector({ 
      type: query,
      subject: query, 
      content: query, 
      recipient: query
    });
    
    // Query Pinecone
    const queryRequest = {
      vector: queryVector,
      topK: parseInt(topK),
      includeMetadata: true
    };
    
    const response = await pineconeIndex.query(queryRequest);
    
    res.json(response.matches);
  } catch (error) {
    console.error("Error searching similar communications:", error);
    res.status(500).json({ error: error.message });
  }
};

// Remove Pinecone references and replace with MongoDB-based logic
const User = require('../models/user.model');

// Mock communications data since we're removing Pinecone
let communications = [
  {
    id: "1",
    type: "email",
    recipient: "customer1@example.com",
    subject: "Special Offer Inside!",
    content: "Check out our new collection...",
    status: "sent",
    createdAt: new Date("2025-10-15T10:30:00Z"),
    scheduledAt: null
  },
  {
    id: "2",
    type: "notification",
    recipient: "customer2@example.com",
    subject: "Order Shipped",
    content: "Your order #12345 has been shipped.",
    status: "sent",
    createdAt: new Date("2025-10-16T14:45:00Z"),
    scheduledAt: null
  }
];

// Get all communications
exports.getCommunications = async (req, res) => {
  try {
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ message: 'Error fetching communications', error: error.message });
  }
};

// Create a new communication
exports.createCommunication = async (req, res) => {
  try {
    const newCommunication = {
      id: Date.now().toString(),
      ...req.body,
      status: req.body.scheduledAt ? "scheduled" : "draft",
      createdAt: new Date().toISOString()
    };
    
    communications.push(newCommunication);
    
    res.status(201).json({
      success: true,
      message: 'Communication created successfully',
      communication: newCommunication
    });
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ message: 'Error creating communication', error: error.message });
  }
};

// Update a communication
exports.updateCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const index = communications.findIndex(comm => comm.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    const updatedCommunication = {
      ...communications[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    communications[index] = updatedCommunication;
    
    res.json({
      success: true,
      message: 'Communication updated successfully',
      communication: updatedCommunication
    });
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ message: 'Error updating communication', error: error.message });
  }
};

// Delete a communication
exports.deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const index = communications.findIndex(comm => comm.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    communications.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Communication deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting communication:', error);
    res.status(500).json({ message: 'Error deleting communication', error: error.message });
  }
};

// Send a communication
exports.sendCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const index = communications.findIndex(comm => comm.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    // Simulate sending (in a real app, you would actually send the communication)
    const updatedCommunication = {
      ...communications[index],
      status: "sent",
      sentAt: new Date().toISOString()
    };
    
    communications[index] = updatedCommunication;
    
    res.json({
      success: true,
      message: 'Communication sent successfully',
      communication: updatedCommunication
    });
  } catch (error) {
    console.error('Error sending communication:', error);
    res.status(500).json({ message: 'Error sending communication', error: error.message });
  }
};
