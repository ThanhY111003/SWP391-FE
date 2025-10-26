// src/pages/admin/PriceTable.jsx
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Space,
  message,
  Tag,
} from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function PriceTable() {
  // Dữ liệu mock để test (sau sẽ thay bằng API)
  const [priceTables, setPriceTables] = useState([
    {
      id: 1,
      name: "Bảng giá Q4-2025",
      effectiveFrom: "2025-10-01",
      effectiveTo: "2025-12-31",
      status: "Active",
      items: [
        { model: "EV Car A", price: 50000 },
        { model: "EV SUV B", price: 70000 },
      ],
    },
    {
      id: 2,
      name: "Bảng giá Q3-2025",
      effectiveFrom: "2025-07-01",
      effectiveTo: "2025-09-30",
      status: "Expired",
      items: [
        { model: "EV Car A", price: 48000 },
        { model: "EV SUV B", price: 69000 },
      ],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Mở modal thêm mới
  const openModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  // Thêm bảng giá mới
  const handleAdd = (values) => {
    const newTable = {
      id: Date.now(),
      name: values.name,
      effectiveFrom: values.period[0].format("YYYY-MM-DD"),
      effectiveTo: values.period[1].format("YYYY-MM-DD"),
      status: "Active",
      items: values.items || [],
    };

    setPriceTables([newTable, ...priceTables]);
    message.success("New price list added!");
    setIsModalOpen(false);
  };

  // Ngừng hiệu lực
  const handleDeactivate = (id) => {
    Modal.confirm({
      title: "Confirmation of termination?",
      content: "Once terminated, this price list cannot be applied to dealers.",
      okText: "Agree",
      cancelText: "Cancel",
      onOk: () => {
        setPriceTables((prev) =>
          prev.map((pt) => (pt.id === id ? { ...pt, status: "Expired" } : pt))
        );
        message.success("Price list has been terminated!");
      },
    });
  };

  const columns = [
    { title: "Price list name", dataIndex: "name", key: "name" },
    {
      title: "Effective period",
      key: "period",
      render: (_, record) => `${record.effectiveFrom} → ${record.effectiveTo}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "Active" ? "green" : "red"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => handleDeactivate(record.id)}
            disabled={record.status !== "Active"}
          >
            Termination of effect
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Price list for vehicle models"
      extra={
        <Button type="primary" onClick={openModal}>
          Add a new price list
        </Button>
      }
    >
      <Table columns={columns} dataSource={priceTables} rowKey="id" />

      {/* Modal thêm bảng giá */}
      <Modal
        open={isModalOpen}
        title="Add a new price list"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="name"
            label="Price list name"
            rules={[{ required: true, message: "Please name the price list!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Example: Bảng giá Q4-2025"
            />
          </Form.Item>

          <Form.Item
            name="period"
            label="Active time"
            rules={[{ required: true, message: "Please choose a valid time!" }]}
          >
            <RangePicker
              allowClear={false}
              defaultValue={[dayjs(), dayjs().add(30, "day")]}
            />
          </Form.Item>

          {/* Demo: nhập giá model */}
          <Form.Item
            label="Price item (example)"
            tooltip="This is demo only, real API will upload models and prices."
          >
            <Space direction="vertical">
              <Space>
                <Select defaultValue="EV Car A" style={{ width: 160 }}>
                  <Option value="EV Car A">EV Car A</Option>
                  <Option value="EV SUV B">EV SUV B</Option>
                </Select>
                <InputNumber min={0} defaultValue={50000} />
              </Space>
              <Space>
                <Select defaultValue="EV SUV B" style={{ width: 160 }}>
                  <Option value="EV SUV B">EV SUV B</Option>
                  <Option value="EV Car A">EV Car A</Option>
                </Select>
                <InputNumber min={0} defaultValue={70000} />
              </Space>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
