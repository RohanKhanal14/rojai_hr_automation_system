//Middleware
const protectCandidateRoute = async (req, res, next) => {
  try {
    //Get The User Object
    const currentUser = req.user; //Created by protectLoginGuard
    if (!currentUser) {
      return res
        .status(401)
        .send({ message: "The user must login to continue!", success: false });
    }
    //Check The Role
    if (currentUser.role !== "candidate") {
      return res.status(401).send({
        message: "Only Candidates are authorized.",
        success: false,
      });
    }
    //Send To Next Request
    next();
  } catch (error) {
    console.error("Internal Server Error!", error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error!", success: false });
  }
};

export default protectCandidateRoute;
