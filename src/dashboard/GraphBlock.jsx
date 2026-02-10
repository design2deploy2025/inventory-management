import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const GraphBlock = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [series] = useState([
    {
      name: "Chosen Period",
      data: [
        23000, 44000, 55000, 57000, 56000, 61000,
        58000, 63000, 60000, 66000, 34000, 78000,
      ],
    },
    {
      name: "Last Period",
      data: [
        17000, 76000, 85000, 101000, 98000, 87000,
        105000, 91000, 114000, 94000, 67000, 66000,
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
      legend: { show: false },
      xaxis: {
        categories: [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
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
          formatter: (val) => (val >= 1000 ? `${val / 1000}k` : val),
          style: {
            fontSize: "13px",
            fontFamily: "Inter, ui-sans-serif",
            color: "#94a3b8",
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) =>
            `$${val >= 1000 ? `${val / 1000}k` : val}`,
        },
        theme: "dark",
      },
      colors: ["#4f46e5", "#6366f1"], // indigo-600 + indigo-500
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
            Income
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-white">
            $126,238.49
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
          25%
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
