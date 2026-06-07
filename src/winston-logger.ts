import { ILogger, LogLevel } from '@sapphire/framework';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class WinstonLogger implements ILogger {
	private winstonLogger: winston.Logger;

	constructor() {
		const logFormat = winston.format.combine(
			winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			winston.format.printf(({ timestamp, level, message }) => {
				return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
			})
		);

		const logLevel = process.env.NODE_ENV === 'dev' ? 'debug' : 'info';
		const logTransports = [
			new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), logFormat) }),
			new DailyRotateFile({ level: 'error', filename: 'logs/error-%DATE%.log', datePattern: 'YYYY-MM-DD', maxFiles: '180d' }),
			new DailyRotateFile({ level: 'info', filename: 'logs/info-%DATE%.log', datePattern: 'YYYY-MM-DD', maxFiles: '30d' })
		];

		this.winstonLogger = winston.createLogger({
			level: logLevel,
			format: logFormat,
			transports: logTransports
		});
	}

	private getWinstonLevel(level: LogLevel): string {
		switch (level) {
			case LogLevel.Fatal:
			case LogLevel.Error:
				return 'error';
			case LogLevel.Warn:
				return 'warn';
			case LogLevel.Info:
				return 'info';
			case LogLevel.Debug:
				return 'debug';
			case LogLevel.Trace:
				return 'silly';
			default:
				return 'info';
		}
	}

	public has(level: LogLevel): boolean {
		const winstonLevel = this.getWinstonLevel(level);
		return this.winstonLogger.levels[winstonLevel] <= this.winstonLogger.levels[this.winstonLogger.level];
	}

	public write(level: LogLevel, ...values: readonly unknown[]): void {
		const message = values.map((value) => (typeof value === 'object' ? JSON.stringify(value) : value)).join(' ');
		this.winstonLogger.log(this.getWinstonLevel(level), message);
	}

	public trace(...values: readonly unknown[]): void {
		this.write(LogLevel.Trace, ...values);
	}

	public debug(...values: readonly unknown[]): void {
		this.write(LogLevel.Debug, ...values);
	}

	public info(...values: readonly unknown[]): void {
		this.write(LogLevel.Info, ...values);
	}

	public warn(...values: readonly unknown[]): void {
		this.write(LogLevel.Warn, ...values);
	}

	public error(...values: readonly unknown[]): void {
		this.write(LogLevel.Error, ...values);
	}

	public fatal(...values: readonly unknown[]): void {
		this.write(LogLevel.Fatal, ...values);
	}
}
