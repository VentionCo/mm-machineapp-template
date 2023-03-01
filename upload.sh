# Upload your new program to the server
echo '****************************************************************'
echo '**************** Uploading your Machine App ********************'
echo '******** You will be prompted to enter your password ***********'
echo '******************** Password is: temppwd ***********************'
echo '****************************************************************'
echo 'Uploading your server/internal program to the MachineMotion...'
scp ./server/internal/*.py debian@192.168.7.2:/var/lib/cloud9/mm-machineapp-template/server/internal
echo 'Internal upload complete.'
echo 'Uploading your server program to the MachineMotion...'
scp ./server/*.py debian@192.168.7.2:/var/lib/cloud9/mm-machineapp-template/server
echo 'Server upload complete.'
echo 'Uploading your client program to the MachineMotion...'
scp -r ./client/* debian@192.168.7.2:/var/lib/cloud9/mm-machineapp-template/client
echo 'Client upload complete.'
