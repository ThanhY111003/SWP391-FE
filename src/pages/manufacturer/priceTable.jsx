// src/pages/manufacturer/PriceTable.jsx
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
          prev.map((t) =>
            t.id === id ? { ...t, status: "Expired" } : t
          )
        );
        message.info("Price list has been deactivated!");
      },
    });
  };

  const columns = [
    { title: "Price list name", dataIndex: "name" },
    {
      title: "Effective period",
      render: (record) =>
        `${record.effectiveFrom} → ${record.effectiveTo}`,
    },
    {
      title: "Status",
      render: (record) =>
        record.status === "Active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="volcano">Expired</Tag>
        ),
    },
    {
      title: "Number of price lines",
      render: (record) => record.items.length,
      align: "center",
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          {record.status === "Active" && (
            <Button danger size="small" onClick={() => handleDeactivate(record.id)}>
              Deactivate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card
        title="📊 Price Table Management"
        extra={
          <Button type="primary" onClick={openModal}>
            + Add New Price List
          </Button>
        }
      >
        <Table
          dataSource={priceTables}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Modal thêm mới bảng giá */}
      <Modal
        title="Create New Price List"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="Price list name"
            rules={[{ required: true, message: "Please enter the price list name!" }]}
          >
            <InputNumber placeholder="For example: Price List Q1-2026" className="w-full" />
          </Form.Item>

          <Form.Item
            name="period"
            label="Effective period"
            rules={[{ required: true, message: "Please select the effective period!" }]}
          >
            <RangePicker
              className="w-full"
              format="YYYY-MM-DD"
              disabledDate={(date) => date.isBefore(dayjs().subtract(1, "day"))}
            />
          </Form.Item>

          <Form.Item label="List of car models and prices">
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" className="mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "model"]}
                        rules={[{ required: true, message: "Please enter the car model name!" }]}
                      >
                        <Select placeholder="Select car model" style={{ width: 180 }}>
                          <Option value="EV Car A">EV Car A</Option>
                          <Option value="EV SUV B">EV SUV B</Option>
                          <Option value="EV Truck C">EV Truck C</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Please enter the price!" }]}
                      >
                        <InputNumber
                          placeholder="Price"
                          min={10000}
                          step={100}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                      <Button onClick={() => remove(name)} type="link" danger>
                        Delete
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Price Row
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
