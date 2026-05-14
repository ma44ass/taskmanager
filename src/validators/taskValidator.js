// schema :  rules that data coming from the server must respect to be valid and accepted 

const {z} = require('zod');

 //Validation pour la tache: 
const taskSchema = z.object({
    title : z.string()
    .min(3, "Le titre doit contenir au mois 3 caractères")
    .max(50, "Le titre est trop long (max 50)"),

    description : z.string().optional(),

    status : z.enum(["pending","in_progress", "completed"]).default("pending"),

    is_completed: z.boolean().default(false),

    due_date: z.string().datetime().optional().nullable()
}).strict();

//Un schéma  UPDATE sans les .default()
const updateTaskSchema = z.object({
    title : z.string().min(3).max(50).optional(),
    description : z.string().optional(),
    status : z.enum(["pending","in_progress", "completed"]).optional(),
    is_completed: z.boolean().optional(),
    due_date: z.string().datetime().optional().nullable()
}).strict();

const idSchema = z.object({
    id : z.string().regex(/^\d+$/, "L'ID doit être un nombre valide")
});


module.exports = { taskSchema, updateTaskSchema, idSchema };
