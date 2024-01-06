class HttpError extends Error{
    constructor(message,errorcode){
        super(message); //add a message property
        this.code=errorcode; // add a code property

    }
}
module.exports=HttpError ;