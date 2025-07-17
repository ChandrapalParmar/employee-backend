import Salary from "../models/Salary.js"
import Employee from "../models/Employee.js"

// Add salary
const addSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, payDate } = req.body

    const totalSalary =
      parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

    const newSalary = new Salary({
      employeeId,
      basicSalary,
      allowances,
      deductions,
      netSalary: totalSalary,
      payDate,
    })

    await newSalary.save()

    return res.status(200).json({ success: true })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "salary add server error" })
  }
}

// Get salary
const getSalary = async (req, res) => {
  try {
    const { id, role } = req.params
    let salary

    if (role === "admin") {
      // Admin: fetch salaries of any employee by their employeeId
      salary = await Salary.find({ employeeId: id }).populate(
        "employeeId",
        "employeeId"
      )
    } else if (role === "employee") {
      // Employee: convert userId to employeeId
      const employee = await Employee.findOne({ userId: id })
      if (!employee) {
        return res.status(404).json({ success: false, error: "Employee not found" })
      }

      salary = await Salary.find({ employeeId: employee._id }).populate(
        "employeeId",
        "employeeId"
      )
    } else {
      return res.status(400).json({ success: false, error: "Invalid role" })
    }

    return res.status(200).json({ success: true, salary })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "salary get server error" })
  }
}

export { addSalary, getSalary }
