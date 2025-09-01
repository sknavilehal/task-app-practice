import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ 
    type: 'varchar',
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  })
  status!: TaskStatus;

  @Column({
    type: 'varchar',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  priority!: TaskPriority;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Constructor for creating instances
  constructor(data?: Partial<Task>) {
    if (data) {
      Object.assign(this, data);
      
      // Validation
      if (!this.title || this.title.trim() === '') {
        throw new Error('Title cannot be empty');
      }
      
      if (!this.userId) {
        throw new Error('User ID is required');
      }
    }
  }

  // Helper methods
  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && this.status !== 'completed';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isOverdue: this.isOverdue(),
      isCompleted: this.isCompleted()
    };
  }

  updateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new Error('Title cannot be empty');
    }
    this.title = title.trim();
    this.updatedAt = new Date();
  }

  updateStatus(status: TaskStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  updatePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  updateDueDate(dueDate?: Date): void {
    this.dueDate = dueDate;
    this.updatedAt = new Date();
  }
} 