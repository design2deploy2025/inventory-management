import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const GraphBlock = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [series] = useState([
    {
      name: "Orders via WhatsApp",
      data: [
        45, 52, 38, 60, 55, 72, 68, 78, 65, 82, 58, 90,
      ],
    },
    {
      name: "Orders via Instagram",
      data: [
        30, 48, 55, 62, 58, 65, 72, 68, 75, 70, 55, 78,
      ],
    },
  ]);

  useEffect(() => {
    setChartOptions({
      chart: {
        type: "bar",
        height: 300,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "16px",
          borderRadius: 0,
        },
      },
      stroke: {
        show: true,
        width: 8,
        colors: ["transparent"],
      },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        labels: {
          style: {
            fontSize: "13px",
            fontFamily: "Inter, ui-sans-serif",
            color: "#94a3b8",
          },
          formatter: (val) => val.slice(0, 3),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val) => val,
          style: {
            fontSize: "13px",
            fontFamily: "Inter, ui-sans-serif",
            color: "#94a3b8",
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} orders`,
        },
        theme: "dark",
      },
      colors: ["#25D366", "#E1306C"], // WhatsApp green + Instagram pink
      grid: {
        borderColor: "#374151",
      },
      responsive: [
        {
          breakpoint: 568,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "14px",
              },
            },
            stroke: { width: 8 },
            xaxis: {
              labels: {
                style: { fontSize: "11px", color: "#94a3b8" },
              },
            },
            yaxis: {
              labels: {
                style: { fontSize: "11px", color: "#94a3b8" },
              },
            },
            legend: {
              show: false
            }
          },
        },
      ],
    });
  }, []);

  return (
    <div className="p-4 md:p-5 min-h-[410px] flex flex-col bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl w-1/2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm text-slate-400">
            Orders by Channel
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-white">
            WhatsApp & Instagram
          </p>
        </div>

        <span className="py-1 px-2 inline-flex items-center gap-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-400">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
          18%
        </span>
      </div>

      {/* Chart */}
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
};

export default GraphBlock;

