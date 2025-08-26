import mongoose, {Schema,model} from 'mongoose'


const ClienteSchema = new mongoose.Schema({
    nombre:{type:String,required:true,trim:true },
    cedula:{
        type:String,
        required:true,
        trim:true },
    email:{
        type:String,
        required:true,
        trim:true,
        unique: true
    },
    telefono:{
        type:String,
        required:true,
        trim:true
    },
    apellido:{
        type:String,
        trim:true
    },
    ciudad:{
        type:String,
        trim:true
    },
    direccion:{
        type:String,
        required:true,
        trim:true
    },
    fecha_nacimiento:{
        type:Date,
        required:true,
        trim:true
    },
    dependencia:{
        type:String,
        required:true,
        trim:true
    },
    
},{ timestamps:true});

export default mongoose.model('Cliente', ClienteSchema);