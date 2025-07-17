import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import Department from "../models/Department.js";

const upload = multer({ storage });

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (!name || !email || !employeeId || !department || !salary || !password || !role) {
      return res.status(400).json({ success: false, error: "All required fields must be provided" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: "User already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: req.file ? req.file.path : "", // Cloudinary URL
    });

    const savedUser = await newUser.save();

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
    });

    await newEmployee.save();
    return res.status(200).json({ success: true, message: "Employee created successfully" });
  } catch (error) {
    console.error("🔥 addEmployee error:", error);
    return res.status(500).json({ success: false, error: "Server error adding employee" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("🔥 getEmployees error:", error);
    return res.status(500).json({ success: false, error: "Server error fetching employees" });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    let employee = await Employee.findById(id)
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");
    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", "name email profileImage")
        .populate("department", "dep_name");
    }
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("🔥 getEmployee error:", error);
    return res.status(500).json({ success: false, error: "Server error fetching employee" });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, maritalStatus, designation, department, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const user = await User.findById(employee.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await User.findByIdAndUpdate(employee.userId, { name });
    await Employee.findByIdAndUpdate(id, { maritalStatus, designation, salary, department });

    return res.status(200).json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
    console.error("🔥 updateEmployee error:", error);
    return res.status(500).json({ success: false, error: "Server error updating employee" });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id })
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("🔥 fetchEmployeesByDepId error:", error);
    return res.status(500).json({ success: false, error: "Server error fetching employees by department" });
  }
};

export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId };