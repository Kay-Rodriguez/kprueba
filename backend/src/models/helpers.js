export const toJSONOpts = {
virtuals: true,
versionKey: false,
transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
};