import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOKS = {
  NEW_MENTOR: process.env.N8N_MENTOR_WEBHOOK || 'http://localhost:5678/webhook/new-mentor',
  NEW_MENTEE: process.env.N8N_MENTEE_WEBHOOK || 'http://localhost:5678/webhook/new-mentor',
  NEW_PROGRAM: process.env.N8N_PROGRAM_WEBHOOK || 'http://localhost:5678/webhook/new-program',
  NEW_CONNECTION: process.env.N8N_CONNECTION_WEBHOOK || 'http://localhost:5678/webhook/mentee-registration',
  MATCHING: process.env.N8N_MATCHING_WEBHOOK || 'http://localhost:5678/webhook/mentee-matching',
};

const triggerWebhook = async (webhookUrl: string, data: any): Promise<void> => {
  try {
    await axios.post(webhookUrl, data);
    console.log(`Webhook triggered: ${webhookUrl}`);
  } catch (error) {
    console.error(`Error triggering webhook ${webhookUrl}:`, error);
  }
};

export const triggerNewMentorWebhook = async (mentorData: any): Promise<void> => {
  await triggerWebhook(WEBHOOKS.NEW_MENTOR, mentorData);
};

export const triggerNewMenteeWebhook = async (menteeData: any): Promise<void> => {
  await triggerWebhook(WEBHOOKS.NEW_MENTEE, menteeData);
};

export const triggerNewProgramWebhook = async (programData: any): Promise<void> => {
  await triggerWebhook(WEBHOOKS.NEW_PROGRAM, programData);
};

export const triggerNewConnectionWebhook = async (mentee_id: any, selected_mentor_id: any): Promise<any> => {
  try {
    const response = await axios.post(WEBHOOKS.NEW_CONNECTION, {
      mentee_id: mentee_id,
      selected_mentor_id: selected_mentor_id
    });
    return response.data;
  } catch (error: any) {
    return {
      error: error.response?.data?.error || 'Failed to create connection',
      status: error.response?.status || 500
    };
  }
};

export const triggerMatchingWebhook = async (menteeData: any): Promise<any> => {
  try {
    const response = await axios.post(WEBHOOKS.MATCHING, menteeData);
    return response.data;
  } catch (error) {
    return { matches: [] };
  }
};