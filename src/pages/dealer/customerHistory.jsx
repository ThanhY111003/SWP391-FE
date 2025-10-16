// src/pages/dealer/CustomerHistory.jsx
import { useEffect, useState } from "react";
import { Table, Card, Tag, Button, Modal, Timeline, message } from "antd";
import DealerLayout from "../components/dealerlayout";

const CustomerHistory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  // 🧠 Giả lập dữ liệu (có lịch sử chuyển nhượng)
  useEffect(() => {
    setTimeout(() => {
      setVehicles([
        {
          id: 1,
          model: "Model A",
          chassis: "CH001",
          engine: "EN001",
          currentCustomer: {
            name: "Nguyen Van B",
            id: "0798123456",
            contact: "0987123456",
            since: "2025-03-12",
          },
          history: [
            {
              name: "Nguyen Van A",
              id: "0123456789",
              contact: "0901234567",
              from: "2024-09-10",
              to: "2025-03-12",
              approvedBy: "EVM_Staff01",
            },
          ],
          status: "Sold to Customer",
        },
        {
          id: 2,
          model: "Model C",
          chassis: "CH002",
          engine: "EN002",
          currentCustomer: {
            name: "Tran Thi C",
            id: "0333456789",
            contact: "0912345678",
            since: "2025-08-01",
          },
          history: [],
          status: "Sold to Customer",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const columns = [
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Chassis",
      dataIndex: "chassis",
      key: "chassis",
    },
    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },
    {
      title: "Current Owner",
      key: "currentCustomer",
      render: (_, record) =>
        record.currentCustomer ? (
          <div>
            <p className="font-medium">{record.currentCustomer.name}</p>
            <p className="text-sm text-gray-500">
              {record.currentCustomer.contact}
            </p>
          </div>
        ) : (
          <Tag color="blue">No owner</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Sold to Customer" ? "red" : "green"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="default"
          onClick={() => {
            setSelectedVehicle(record);
            setIsModalOpen(true);
          }}
        >
          View History
        </Button>
      ),
    },
  ];

  // 🧾 Modal hiển thị lịch sử khách hàng
  const renderHistoryTimeline = (history) => {
    if (!history || history.length === 0)
      return <p>No previous ownership history.</p>;

    return (
      <Timeline
        items={history.map((h) => ({
          color: "blue",
          children: (
            <div>
              <p>
                <strong>{h.name}</strong> ({h.contact})
              </p>
              <p className="text-sm text-gray-600">
                Owned from {h.from} → {h.to}
              </p>
              <p className="text-xs text-gray-400">
                Approved by: {h.approvedBy}
              </p>
            </div>
          ),
        }))}
      />
    );
  };

  // Giả lập yêu cầu chuyển nhượng (BR7.5)
  const handleTransferRequest = () => {
    if (role === "Dealer_Manage") {
      message.info("Transfer request sent to Manufacturer for approval.");
    } else if (role === "Manufacturer") {
      message.success("Vehicle transfer approved.");
    } else {
      message.warning(
        "Only dealer managers or manufacturer can perform this action."
      );
    }
  };

  return (
    <DealerLayout>
      <Card title="Customer Ownership History">
        <Table
          loading={loading}
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Modal xem lịch sử */}
      <Modal
        open={isModalOpen}
        title={`Ownership history - ${selectedVehicle?.model}`}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
          role === "Dealer_Manage" && (
            <Button
              key="transfer"
              type="primary"
              onClick={handleTransferRequest}
            >
              Request Transfer
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedVehicle && (
          <>
            <p>
              <strong>Current Owner:</strong>{" "}
              {selectedVehicle.currentCustomer?.name} (
              {selectedVehicle.currentCustomer?.contact})
            </p>
            <hr className="my-3" />
            <h4 className="mb-2 font-semibold">Ownership History:</h4>
            {renderHistoryTimeline(selectedVehicle.history)}
          </>
        )}
      </Modal>
    </DealerLayout>
  );
};

export default CustomerHistory;
