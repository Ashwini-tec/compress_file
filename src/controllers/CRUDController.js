const { MESSAGE } = require("../../utils/constant");
const bcrypt = require("bcrypt");

/********************* create  **************** */
const create = (model) => async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        if(req.body.password){
            req.body.password = bcrypt.hashSync(req.body.password, 10);
        }
        const user = await model.findOne({ email: req.body.email });
        if(user){
            return res.status(400).send({ data: MESSAGE.USER_ALREADY_EXIST });
        }
        const result = await model.create(req.body);
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********************* get by id  **************** */
const get = (model) => async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result =  await model.findOne({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********************* get all  **************** */
const getAll = (model) => async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result =  await model.find();
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********************* update  **************** */
const update = (model) => async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        let result = await model.findOne({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        if(req.body.password){
            req.body.password = bcrypt.hashSync(req.body.password, 10);
        }
        const data = await model.findOneAndUpdate({ _id: req.params.id }, req.body, { new : true });
        return res.status(200).json({ data: data });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********************* delete **************** */
const remove = (model) => async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result = await model.findOneAndDelete({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

module.exports = ( model ) => ({
    create: create(model),
    get: get(model),
    getAll: getAll(model),
    update: update(model),
    remove: remove(model),
});
