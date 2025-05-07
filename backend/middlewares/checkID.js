const checkID = ()=>{
    return (req, res, next) => {
        const {emp_ID} = req.user;
        const {empId} = req.params;

        // res.status(201).json({message: `params: ${empId} JWT: ${emp_ID}`})
    
        if (emp_ID != empId) {
          return res.status(403).json({ message: "Access denied: ID Mismatch!" });
        }
    
        next();
      };
}

module.exports = checkID;