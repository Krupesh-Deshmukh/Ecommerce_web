import java.util.Scanner;

public class Student{
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        System.out.print("Enter Your Name: ");
        String name=input.nextLine();
        System.out.println("User Name Is: "+name);

        System.out.println("Enter First Nuber: ");
        int num1=input.nextInt();

        System.out.println("Enter Second Number: ");
        int num2= input.nextInt();

        int sum=num1+num2;
        System.out.println(sum);

        double myDouble=3857.20;
        int value= (int) myDouble;
        System.out.println(value);

        int a = 10;
        int b = 3;
        System.out.println(a / b);   // Integer division, result is 3

        double c = 10.0d;
        double d = 3.0d;
        int names=(int)d;
        int namess=(int)c;
        System.out.println((int)c/(int)d);

        System.out.println("Swapping of two numbers : ");
        System.out.print("Enter The First Number");
        int input1=input.nextInt();
        System.out.print("Enter Second Number: ");
        int input2=input.nextInt();
        System.out.println("After Swapping ");
        int temp=input1;
        input1=input2;
        input2=temp;
        System.out.print("Input1: "+ input1+ " , Input2: "+input2);


    }
}