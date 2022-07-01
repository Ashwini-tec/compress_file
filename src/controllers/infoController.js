const { MESSAGE } = require("../../utils/constant");

/********************* create  **************** */
const create = (model) => async(req, res)=>{
    try {
        const originalReq = req.body;
        // JSON.parse(req.body["4"]);
        // console.log(originalReq.originalRequest.init);
        const data = {data :originalReq };
        // console.log(data);
        // console.log(originalReq["init"]);
        const result = await model.create(data);
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********************* get by id  **************** */
const get = (model) => async(req, res)=>{
    try {
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
        const result =  await model.find();
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

module.exports = ( model ) => ({
    create: create(model),
    get: get(model),
    getAll: getAll(model),
});
