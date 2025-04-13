// test-api.js
const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:3000';

// Store IDs for created entities
let mentorId = null;
let menteeId = null;
let programId = null;
let connectionId = null;

// Test data
const testMentor = {
  name: 'Test Mentor',
  email: `mentor-${Date.now()}@test.com`, // Ensure unique email
  bio: 'Test bio for mentor',
  expertise: 'Test expertise',
  experience_years: 5
};

const testMentee = {
  name: 'Test Mentee',
  email: `mentee-${Date.now()}@test.com`, // Ensure unique email
  goals: 'Test goals for mentee'
};

// Helper function to run tests
async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Test 1: Register a mentor
    console.log('\n--- Testing mentor registration ---');
    const mentorRes = await axios.post(`${API_URL}/mentors/register`, testMentor);
    console.log('Mentor created:', mentorRes.data.success ? 'SUCCESS' : 'FAILED');
    mentorId = mentorRes.data.mentor.id;
    console.log('Mentor ID:', mentorId);
    
    // Test 2: Get mentor by email
    console.log('\n--- Testing get mentor by email ---');
    const getMentorRes = await axios.get(`${API_URL}/mentors/email/${testMentor.email}`);
    console.log('Get mentor:', getMentorRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Get all mentors
    console.log('\n--- Testing get all mentors ---');
    const allMentorsRes = await axios.get(`${API_URL}/mentors`);
    console.log('Get all mentors:', allMentorsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Total mentors:', allMentorsRes.data.mentors.length);
    
    // Test 4: Register a mentee
    console.log('\n--- Testing mentee registration ---');
    const menteeRes = await axios.post(`${API_URL}/mentees/register`, testMentee);
    console.log('Mentee created:', menteeRes.data.success ? 'SUCCESS' : 'FAILED');
    menteeId = menteeRes.data.mentee.id;
    console.log('Mentee ID:', menteeId);
    
    // Test 5: Get mentee by email
    console.log('\n--- Testing get mentee by email ---');
    const getMenteeRes = await axios.get(`${API_URL}/mentees/email/${testMentee.email}`);
    console.log('Get mentee:', getMenteeRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 6: Create a program
    console.log('\n--- Testing program creation ---');
    const testProgram = {
      mentor_email: testMentor.email,
      title: 'Test Program',
      description: 'Test program description',
      session_type: 'One-on-One',
      price: 100.00,
      duration: 60,
      session_date: new Date().toISOString().split('T')[0]
    };
    
    const programRes = await axios.post(`${API_URL}/programs`, testProgram);
    console.log('Program created:', programRes.data.success ? 'SUCCESS' : 'FAILED');
    programId = programRes.data.program.id;
    console.log('Program ID:', programId);
    
    // Test 7: Get programs by mentor
    console.log('\n--- Testing get programs by mentor ---');
    const mentorProgramsRes = await axios.get(`${API_URL}/programs/mentor/${testMentor.email}`);
    console.log('Get mentor programs:', mentorProgramsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Mentor programs count:', mentorProgramsRes.data.programs.length);
    
    // Test 8: Create a connection
    console.log('\n--- Testing connection creation ---');
    const testConnection = {
      mentor_id: mentorId,
      mentee_id: menteeId
    };
    
    const connectionRes = await axios.post(`${API_URL}/connections`, testConnection);
    console.log('Connection created:', connectionRes.data.success ? 'SUCCESS' : 'FAILED');
    connectionId = connectionRes.data.connection.id;
    console.log('Connection ID:', connectionId);
    
    // Test 9: Get connections by mentor
    console.log('\n--- Testing get connections by mentor ---');
    const mentorConnectionsRes = await axios.get(`${API_URL}/connections/mentor/${mentorId}`);
    console.log('Get mentor connections:', mentorConnectionsRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 10: Get connections by mentee
    console.log('\n--- Testing get connections by mentee ---');
    const menteeConnectionsRes = await axios.get(`${API_URL}/connections/mentee/${menteeId}`);
    console.log('Get mentee connections:', menteeConnectionsRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 11: Update program
    console.log('\n--- Testing program update ---');
    const programUpdate = {
      description: 'Updated program description',
      price: 120.00
    };
    
    const updateProgramRes = await axios.put(`${API_URL}/programs/${programId}`, programUpdate);
    console.log('Update program:', updateProgramRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 12: Delete connection (cleanup)
    console.log('\n--- Cleanup: Delete connection ---');
    const deleteConnectionRes = await axios.delete(`${API_URL}/connections/${connectionId}`);
    console.log('Delete connection:', deleteConnectionRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 13: Delete program (cleanup)
    console.log('\n--- Cleanup: Delete program ---');
    const deleteProgramRes = await axios.delete(`${API_URL}/programs/${programId}`);
    console.log('Delete program:', deleteProgramRes.data.success ? 'SUCCESS' : 'FAILED');
    
    console.log('\nAPI testing completed successfully!');
  } catch (error) {
    console.error('Error during API testing:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.error('Endpoint:', error.config?.url);
    console.error('Method:', error.config?.method.toUpperCase());
  }
}

// Run the tests
runTests();