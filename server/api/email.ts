export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Add email sending logic here (e.g., using nodemailer)
  console.log('Email')
})