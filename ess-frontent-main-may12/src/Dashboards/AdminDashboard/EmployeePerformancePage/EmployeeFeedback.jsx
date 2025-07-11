import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import AddReview from "./AddReview";
// import UpdateReview from "./UpdateReview";
const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeeFeedback = () => {
  const [employeefeedbackList, setEmployeeFeedbackList] = useState([]);
  //   const [managerList, setManagerList] = useState([]);
  //   const [addReviewPopup, setAddReviewPopup] = useState(false);
  //   const [updateReviewPopup, setUpdateReviewPopup] = useState(false);
  //   const [selectedReview, setSelectedReview] = useState(null);

  // Fetch the review list from the API
  const fetchEmployeeFeedbackList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/feedback/list/`);
      setEmployeeFeedbackList(
        data.map((feedback) => ({
          id: feedback.id,
          from_manager: feedback.from_manager.manager_name,
          to_employee: feedback.to_employee.employee_name, // Extract manager_name
          comments: feedback.comments,
          feedback_date: feedback.feedback_date,
        })),
      );
    } catch (error) {
      console.error("Error fetching employee feedback list:", error);
    }
  };

  // Fetch the manager list from the API
  //   const fetchManagerList = async () => {
  //     try {
  //       const { data } = await axios.get(`http://127.0.0.1:8000/api/manager_list/`);
  //       setManagerList(data);
  //     } catch (error) {
  //       console.error("Error fetching manager list:", error);
  //     }
  //   };

  useEffect(() => {
    fetchEmployeeFeedbackList();
    // fetchManagerList();
  }, []);

  // Handle editing a review
  //   const handleEdit = (row) => {
  //     setSelectedReview(row);
  //     setUpdateReviewPopup(true);
  //   };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/delete-feedback/${row.id}/`);
      toast.success(`Employee Feedback ID ${row.id} deleted successfully.`);
      fetchEmployeeFeedbackList();
    } catch (error) {
      toast.error("Failed to delete Feedback.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "from_manager", headerName: "Manager Name", width: 200 },
    { field: "to_employee", headerName: "Employee Name", width: 200 },
    { field: "comments", headerName: "Comments", width: 200 },
    { field: "feedback_date", headerName: "Feedback Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          {/* <button className="btn-primary" onClick={() => handleEdit(params.row)}>
            <Edit />
          </button> */}
          <button
            className="btn-danger"
            onClick={() => handleDelete(params.row)}
          >
            <Trash2Icon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="h-full min-h-screen p-6 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Employee Feedback List</h3>
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddReviewPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Performance Review
          </button> */}
        </div>

        <div className="border rounded-lg">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeefeedbackList.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.id}</TableCell>
                  <TableCell>{feedback.from_manager}</TableCell>
                  <TableCell>{feedback.to_employee}</TableCell>
                  <TableCell>{feedback.comments}</TableCell>
                  <TableCell>{feedback.feedback_date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* <button className="btn-primary" onClick={() => handleEdit(feedback)}>
            <Edit />
          </button> */}
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(feedback)}
                      >
                        <Trash2Icon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* <DataGrid
          rows={employeefeedbackList}
          columns={columns}
          getRowId={(row) => row.id} // Ensure unique ID is used
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 6,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        /> */}

        {/* Add Manager Review Modal */}
        {/* {addReviewPopup && (
          <AddReview
            setAddReviewPopup={setAddReviewPopup}
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )} */}

        {/* Update Manager Review Modal */}
        {/* {updateReviewPopup && selectedReview && (
          <UpdateReview
            setUpdateReviewPopup={setUpdateReviewPopup}
            reviewId={selectedReview.id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )} */}
      </div>
    </>
  );
};

export default EmployeeFeedback;
