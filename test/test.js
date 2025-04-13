// enhanced-test.js
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
    
    // Test 2: Try to register a mentor with the same email (should fail)
    console.log('\n--- Testing mentor duplicate email validation ---');
    try {
      await axios.post(`${API_URL}/mentors/register`, testMentor);
      console.log('Duplicate mentor check: FAILED - Should have rejected duplicate email');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('Duplicate mentor check: SUCCESS - Properly rejected duplicate email');
      } else {
        throw error;
      }
    }
    
    // Test 3: Get mentor by email
    console.log('\n--- Testing get mentor by email ---');
    const getMentorRes = await axios.get(`${API_URL}/mentors/email/${testMentor.email}`);
    console.log('Get mentor:', getMentorRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Get mentor by ID
    console.log('\n--- Testing get mentor by ID ---');
    const getMentorByIdRes = await axios.get(`${API_URL}/mentors/id/${mentorId}`);
    console.log('Get mentor by ID:', getMentorByIdRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 5: Get non-existent mentor (should fail gracefully)
    console.log('\n--- Testing get non-existent mentor ---');
    try {
      await axios.get(`${API_URL}/mentors/email/nonexistent@test.com`);
      console.log('Non-existent mentor check: FAILED - Should have returned 404');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Non-existent mentor check: SUCCESS - Properly returned 404');
      } else {
        throw error;
      }
    }
    
    // Test 6: Get all mentors
    console.log('\n--- Testing get all mentors ---');
    const allMentorsRes = await axios.get(`${API_URL}/mentors`);
    console.log('Get all mentors:', allMentorsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Total mentors:', allMentorsRes.data.mentors.length);
    
    // Test 7: Update mentor
    console.log('\n--- Testing mentor update ---');
    const mentorUpdate = {
      bio: 'Updated bio for test mentor',
      experience_years: 6
    };
    const updateMentorRes = await axios.put(`${API_URL}/mentors/${mentorId}`, mentorUpdate);
    console.log('Update mentor:', updateMentorRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Updated experience years:', updateMentorRes.data.mentor.experience_years);
    
    // Test 8: Register a mentee
    console.log('\n--- Testing mentee registration ---');
    const menteeRes = await axios.post(`${API_URL}/mentees/register`, testMentee);
    console.log('Mentee created:', menteeRes.data.success ? 'SUCCESS' : 'FAILED');
    menteeId = menteeRes.data.mentee.id;
    console.log('Mentee ID:', menteeId);
    
    // Test 9: Try to register a mentee with the same email (should fail)
    console.log('\n--- Testing mentee duplicate email validation ---');
    try {
      await axios.post(`${API_URL}/mentees/register`, testMentee);
      console.log('Duplicate mentee check: FAILED - Should have rejected duplicate email');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('Duplicate mentee check: SUCCESS - Properly rejected duplicate email');
      } else {
        throw error;
      }
    }
    
    // Test 10: Get mentee by email
    console.log('\n--- Testing get mentee by email ---');
    const getMenteeRes = await axios.get(`${API_URL}/mentees/email/${testMentee.email}`);
    console.log('Get mentee:', getMenteeRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 11: Get all mentees
    console.log('\n--- Testing get all mentees ---');
    const allMenteesRes = await axios.get(`${API_URL}/mentees`);
    console.log('Get all mentees:', allMenteesRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Total mentees:', allMenteesRes.data.mentees.length);
    
    // Test 12: Update mentee
    console.log('\n--- Testing mentee update ---');
    const menteeUpdate = {
      goals: 'Updated goals for test mentee'
    };
    const updateMenteeRes = await axios.put(`${API_URL}/mentees/${menteeId}`, menteeUpdate);
    console.log('Update mentee:', updateMenteeRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Updated goals:', updateMenteeRes.data.mentee.goals);
    
    // Test 13: Create a program
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
    
    // Test 14: Create a program with non-existent mentor (should fail)
    console.log('\n--- Testing program with non-existent mentor ---');
    const invalidProgram = {
      mentor_email: 'nonexistent@test.com',
      title: 'Invalid Program',
      session_date: new Date().toISOString().split('T')[0]
    };
    
    try {
      await axios.post(`${API_URL}/programs`, invalidProgram);
      console.log('Invalid program check: FAILED - Should have rejected non-existent mentor');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Invalid program check: SUCCESS - Properly rejected non-existent mentor');
      } else {
        throw error;
      }
    }
    
    // Test 15: Get programs by mentor
    console.log('\n--- Testing get programs by mentor ---');
    const mentorProgramsRes = await axios.get(`${API_URL}/programs/mentor/${testMentor.email}`);
    console.log('Get mentor programs:', mentorProgramsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Mentor programs count:', mentorProgramsRes.data.programs.length);
    
    // Test 16: Get all programs
    console.log('\n--- Testing get all programs ---');
    const allProgramsRes = await axios.get(`${API_URL}/programs`);
    console.log('Get all programs:', allProgramsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Total programs:', allProgramsRes.data.programs.length);
    
    // Test 17: Create a connection
    console.log('\n--- Testing connection creation ---');
    const testConnection = {
      mentor_id: mentorId,
      mentee_id: menteeId
    };
    
    const connectionRes = await axios.post(`${API_URL}/connections`, testConnection);
    console.log('Connection created:', connectionRes.data.success ? 'SUCCESS' : 'FAILED');
    connectionId = connectionRes.data.connection.id;
    console.log('Connection ID:', connectionId);
    
    // Test 18: Create a connection with the same mentor and mentee (should fail)
    console.log('\n--- Testing duplicate connection validation ---');
    try {
      await axios.post(`${API_URL}/connections`, testConnection);
      console.log('Duplicate connection check: FAILED - Should have rejected duplicate connection');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('Duplicate connection check: SUCCESS - Properly rejected duplicate connection');
      } else {
        throw error;
      }
    }
    
    // Test 19: Create a connection with non-existent mentor (should fail)
    console.log('\n--- Testing connection with non-existent mentor ---');
    const invalidConnection1 = {
      mentor_id: 99999, // Non-existent ID
      mentee_id: menteeId
    };
    
    try {
      await axios.post(`${API_URL}/connections`, invalidConnection1);
      console.log('Invalid mentor connection check: FAILED - Should have rejected non-existent mentor');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Invalid mentor connection check: SUCCESS - Properly rejected non-existent mentor');
      } else {
        throw error;
      }
    }
    
    // Test 20: Create a connection with non-existent mentee (should fail)
    console.log('\n--- Testing connection with non-existent mentee ---');
    const invalidConnection2 = {
      mentor_id: mentorId,
      mentee_id: 99999 // Non-existent ID
    };
    
    try {
      await axios.post(`${API_URL}/connections`, invalidConnection2);
      console.log('Invalid mentee connection check: FAILED - Should have rejected non-existent mentee');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Invalid mentee connection check: SUCCESS - Properly rejected non-existent mentee');
      } else {
        throw error;
      }
    }
    
    // Test 21: Get connections by mentor
    console.log('\n--- Testing get connections by mentor ---');
    const mentorConnectionsRes = await axios.get(`${API_URL}/connections/mentor/${mentorId}`);
    console.log('Get mentor connections:', mentorConnectionsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Mentor connections count:', mentorConnectionsRes.data.connections.length);
    
    // Test 22: Get connections by mentee
    console.log('\n--- Testing get connections by mentee ---');
    const menteeConnectionsRes = await axios.get(`${API_URL}/connections/mentee/${menteeId}`);
    console.log('Get mentee connections:', menteeConnectionsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Mentee connections count:', menteeConnectionsRes.data.connections.length);
    
    // Test 23: Update program
    console.log('\n--- Testing program update ---');
    const programUpdate = {
      description: 'Updated program description',
      price: 120.00
    };
    
    const updateProgramRes = await axios.put(`${API_URL}/programs/${programId}`, programUpdate);
    console.log('Update program:', updateProgramRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Updated price:', updateProgramRes.data.program.price);
    
    // Test 24: Test the matching endpoint
    console.log('\n--- Testing matching endpoint ---');
    const matchData = {
      name: 'Match Test User',
      email: `match-test-${Date.now()}@test.com`,
      goals: 'Test matching goals'
    };
    
    try {
      const matchRes = await axios.post(`${API_URL}/matching/find-matches`, matchData);
      console.log('Find matches:', matchRes.data.success ? 'SUCCESS' : 'FAILED');
      console.log('Matches found:', matchRes.data.matches.length);
    } catch (error) {
      console.log('Find matches: FAILED - This could be expected if n8n is not configured properly');
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data || error.message);
    }
    
    // Test 25: Test create mentee with connection endpoint
    console.log('\n--- Testing create mentee with connection endpoint ---');
    const createWithConnectionData = {
      mentee_name: `New Mentee ${Date.now()}`,
      mentee_email: `new-mentee-${Date.now()}@test.com`,
      mentee_goals: 'Goals for new mentee',
      selected_mentor_id: mentorId
    };
    
    try {
      const createWithConnectionRes = await axios.post(`${API_URL}/matching/create-mentee-with-connection`, createWithConnectionData);
      console.log('Create mentee with connection:', createWithConnectionRes.data.success ? 'SUCCESS' : 'FAILED');
      if (createWithConnectionRes.data.success) {
        console.log('New mentee ID:', createWithConnectionRes.data.mentee.id);
        console.log('New connection ID:', createWithConnectionRes.data.connection.id);
      }
    } catch (error) {
      console.log('Create mentee with connection: FAILED');
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data || error.message);
    }
    
    // Test 26: Delete connection (cleanup)
    console.log('\n--- Cleanup: Delete connection ---');
    const deleteConnectionRes = await axios.delete(`${API_URL}/connections/${connectionId}`);
    console.log('Delete connection:', deleteConnectionRes.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 27: Delete program (cleanup)
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