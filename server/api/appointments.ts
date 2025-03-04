// server/api/appointments.js
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const storage = useStorage('appointments');
  const appointments: Array<string | number | true | object | null> = []
  appointments.push(await storage.getItem('appointments') || null);

  if (method === 'GET') {
    return appointments;
  } else if (method === 'POST') {
    const body = await readBody(event);
    const newAppointment = { ...body, id: Date.now() };
    appointments.push(newAppointment);
    await storage.setItem('data', appointments);
    return newAppointment;
  } else if (method === 'PUT') {
    if (appointments.every((v) => !!v)) {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const index = typeof id === 'string' ? appointments.findIndex(a => {
      !!a && a.hasOwnProperty('id') && a.id === parseInt(id)
    }) : -1;
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...body, id: parseInt(id) };
      await storage.setItem('data', appointments);
      return appointments[index];
    } else {
      throw createError({ statusCode: 404, statusMessage: 'Appointment not found' });
    }}
  } else if (method === 'DELETE') {
    const id = getRouterParam(event, 'id');
    const index = typeof id === 'string' ? appointments.findIndex(a => {
      !!a && a.hasOwnProperty('id') && a.id === parseInt(id)
    }) : -1;
    if (index !== -1) {
      appointments.splice(index, 1);
      await storage.setItem('data', appointments);
      return { message: 'Appointment deleted' };
    } else {
      throw createError({ statusCode: 404, statusMessage: 'Appointment not found' });
    }
  }

  return 'Method not supported';
})